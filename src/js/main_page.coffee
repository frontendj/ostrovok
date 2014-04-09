window.MainPage = (->

  _private =

    filterObject: {}

    sortObject:
      sortBy: null
      sortDirection: 'down'

    setRangeSlider: ->

      $("#price-range").ionRangeSlider
        'type': 'double'
        'min': 500
        'max': 5000
        'step': 200
        'hideMinMax': true
        'hideFromTo': true
        onChange: (obj) ->
          value = obj.input[0].value
          from = value.split(';')[0]
          to = value.split(';')[1]

          $('#price-range-from').val(from).change()
          $('#price-range-to').val(to).change()

    filterSort: ->
      list = $('#results-items')

      that = @

      sortBy = 'stars'
      sortDirection = 'down'

      $('#results-sort').find('.b-results-sort__item').click ->

        if !$(this).hasClass 'active'
          $(this).addClass('active').siblings().removeClass('active')
        else
          sortDirection = (if (sortDirection is "down") then "up" else "down")

        $(this).removeClass('down, up').addClass(sortDirection)

        that.sortObject.sortBy = $(this).data('sort')
        that.sortObject.sortDirection = sortDirection

        that.showHotels()

    prepareTemplates: ->
      source   = $("#hotel-template").html()
      @hotel_template = Handlebars.compile(source)

      Handlebars.registerHelper "ifCond", (v1, v2, options) ->
        return options.fn(this) if v1 is v2
        options.inverse this


    showHotels: ->

      list = $('#results-items')
      hotels = @getHotels(10)

      list.html(@hotel_template({'hotels': hotels})).find('[data-action=true]').addClass('b-hotel-card_action')


    getHotels: (limit = 10) ->

      hotels = window.data.hotels
      filterObject = @filterObject
      sortObject = @sortObject
      filteredHotels = []
      sortedHotels = []

      hotels.forEach (hotel) ->
        isMatching = true

        for key of filterObject

          if key == 'price-range-from' && filterObject[key].length
            if parseInt(hotel.price, 10) < parseInt(filterObject[key][0], 10)
              isMatching = false
          if key == 'price-range-to' && filterObject[key].length
            if parseInt(hotel.price, 10) > parseInt(filterObject[key][0], 10)
              isMatching = false
          if key == 'title' && filterObject[key].length && filterObject[key][0].length > 3
            if hotel.title.toLowerCase().indexOf(filterObject[key][0].toLowerCase()) < 0
              isMatching = false
          if key == 'stars' && filterObject[key].length
            if filterObject[key].indexOf(hotel.stars.toString()) < 0
              isMatching = false
          if key == 'distance' && filterObject[key].length
            if parseInt(filterObject[key],10) >  parseInt(hotel.distance)+5 || parseInt(filterObject[key]) <  parseInt(hotel.distance)-5
              isMatching = false
          if key == 'score' && filterObject[key].length && filterObject[key][0] != '0'
            if filterObject[key][0] != hotel.score.replace(/\s/, '+')
              isMatching = false

        if isMatching
          filteredHotels.push(hotel)

      if sortObject.sortBy
        filteredHotels.sort((a, b) ->

          aWeight = a[sortObject.sortBy]
          bWeight = b[sortObject.sortBy]
          if sortObject.sortDirection == 'down'
            return -1  if aWeight > bWeight
            return 1  if aWeight < bWeight
          else
            return -1  if aWeight < bWeight
            return 1  if aWeight > bWeight
          0
        )

      i = 0
      while i < filteredHotels.length && i < limit
        sortedHotels.push(filteredHotels[i])
        i++

      sortedHotels


    peopleSelector: ->

      increase = (target) ->
        value = (parseInt(target.val()) + 1) || 1
        if value >= 50
          value = 50
        target.attr('value',value).change()

      decrease = (target) ->
        value = (parseInt(target.val()) - 1) || 0
        if value <= 0
          value = 0
          if target.data('allow-nil') == false
            value = 1
        target.attr('value',value).change()


      $('#main-search .change').click ->
        target = $(this).siblings().filter('input')
        if $(this).hasClass 'change_more'
          increase(target)
        else
          decrease(target)

      $('#main-search').on "change", 'input', (e) ->
        value = $(e.target).val()
        if parseInt(value) == 0
          $(e.target).addClass('empty')
        else
          $(e.target).removeClass('empty').attr('value', value)


      $('#main-search .b-main-search__wrap_people').on "mousewheel DOMMouseScroll", 'input', (e) ->
        target = $(e.target)
        if e.originalEvent.wheelDelta > 0 or e.originalEvent.detail < 0
          increase(target)
        else
          decrease(target)
        e.stopPropagation()
        e.preventDefault();

    calendar: ->

      $('.js-date-from').datepicker
        changeMonth: true
        minDate: 0
        dateFormat: 'd MM'
        onSelect: (selectedDate, inst) ->

          $('.js-date-to').datepicker( "option", "minDate", selectedDate)

        onClose: (selectedDate) ->
          $('.js-date-to').datepicker('show') if $('.js-date-to').val() == ''

      $('.js-date-to').datepicker
        defaultDate: "+1w"
        changeMonth: true
        minDate: +1
        dateFormat: 'd MM'
        onSelect: (selectedDate, inst) ->

          $('.js-date-from').datepicker( "option", "maxDate", selectedDate)

        onClose: (selectedDate) ->

          $('.js-date-from').datepicker('show') if $('.js-date-from').val() == ''

    deparam: (query) ->

      query = query.slice(1)  if query.slice(0, 1) is "?"
      map = {}
      if query != ""
        pairs = query.split("&")
        i = 0

        while i < pairs.length
          keyValuePair = pairs[i].split("=")
          key = decodeURIComponent(keyValuePair[0])
          value = (if (keyValuePair.length > 1) then decodeURIComponent(keyValuePair[1]) else `undefined`)
          if !map[key]
            map[key] = []
          map[key].push(value)
          i += 1
      map


    listenFilter: ->
      $('#filter').on 'change', 'input, select', =>
        clearTimeout @timer  if @timer
        @timer = setTimeout(=>
          @filterObject = @deparam($('#filter').serialize())
          @showHotels()
          return
        , 500)

  Map:

    init: ->

      if not window.YMaps
        App.YMInitTimeout = window.setTimeout @init, 1000
      else
        YMaps.load window.MainPage.Map.showMap

    showMap: ->

      @map = new YMaps.Map(YMaps.jQuery("#map_canvas")[0])
      map = @map

      map = new YMaps.Map(YMaps.jQuery("#map_canvas")[0])
      map.setCenter new YMaps.GeoPoint(37.7,55.7), 14
      map.setType YMaps.MapType.ROADMAP

      map.addControl(new YMaps.TypeControl())
      map.addControl(new YMaps.ToolBar())
      map.addControl(new YMaps.Zoom())
      map.addControl(new YMaps.ScaleLine())
      map.enableScrollZoom()

      point = new YMaps.GeoPoint(38.166317,55.571287)

  init: ->

    _private.setRangeSlider()
    _private.filterSort()
    _private.peopleSelector()
    _private.calendar()
    _private.prepareTemplates()
    _private.showHotels()
    _private.listenFilter()
    @Map.init()


    return

)()

$ -> window.MainPage.init()





