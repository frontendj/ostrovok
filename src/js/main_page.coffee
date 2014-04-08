window.MainPage = (->

  _private =

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

          $('#price-range-from').val from
          $('#price-range-to').val to

    filterSort: ->
      list = $('#results-items')

      that = @

      if list.length

        sortBy = 'stars'
        sortDirection = 'down'

        $('#results-sort').find('.b-results-sort__item').click ->

          if !$(this).hasClass 'active'
            $(this).addClass('active').siblings().removeClass('active')
          else
            sortDirection = (if (sortDirection is "down") then "up" else "down")

          $(this).removeClass('down, up').addClass(sortDirection)

          sortBy = $(this).data('sort')

          that.showHotels(sortBy, sortDirection)


    sortResults: (list, sortBy, sortDirection = 'down', limit = 10) ->

      if sortBy
        list.sort((a, b) ->

          aWeight = a[sortBy]
          bWeight = b[sortBy]
          if sortDirection == 'down'
            return -1  if aWeight > bWeight
            return 1  if aWeight < bWeight
          else
            return -1  if aWeight < bWeight
            return 1  if aWeight > bWeight
          0
        )

      resultList = []
      i = 0
      while i < limit
        resultList.push(list[i])
        i++

      resultList

    prepareTemplates: ->
      source   = $("#hotel-template").html()
      @hotel_template = Handlebars.compile(source)

      Handlebars.registerHelper "ifCond", (v1, v2, options) ->
        return options.fn(this) if v1 is v2
        options.inverse this


    showHotels: (sortBy, sortDirection='down') ->

      list = $('#results-items')
      hotels = @getHotels(sortBy, sortDirection, 10)

      list.html(@hotel_template({'hotels': hotels})).find('[data-action=true]').addClass('b-hotel-card_action')


    getHotels: (sortBy, sortDirection='down', limit = 10)->
      @sortResults(window.data.hotels, sortBy, sortDirection, limit)

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
    @Map.init()


    return

)()

$ -> window.MainPage.init()





