window.App =

  initialize: ->

    @phoneSelector()
    @headerSelector()

  phoneSelector: ->
    selector = $('#phone-selector')

    if selector.length
      countriesPlace = selector.find('[data-role="countries"]')

      selector.click (e) ->
        countries = countriesPlace.find('li')
        if countries.length <= 0
          $.each window.data.contacts, (index, item) ->
            countriesPlace.append '<li class="b-header-phone-selector__countries__item" data-index="'+index+'">'+item.country+'</li>'

        countriesPlace.show()
        e.stopPropagation()

      $('html').on "click", ->
        countriesPlace.hide()

      countriesPlace.on "click", 'li', (e) ->
        index = $(this).addClass('active').siblings().removeClass('active').end().data 'index'
        data = window.data.contacts[index].phones
        $('#header-phones').empty()
        $.each data, (index, item) ->
          $('#header-phones').append '<div class="b-header-phones__item"><div class="b-header-phones__item__value">'+item.value+'</div><div class="b-header-phones__item__desc">'+item.desc+'</div></div>'
          countriesPlace.hide()
          e.stopPropagation()


  headerSelector: ->

    $('.b-header-selector__item').click (e) ->

      parent = $(this).closest('.b-header-selector')
      parent.siblings().removeClass('active')
      if parent.hasClass 'active'
        parent.removeClass 'active'
        $(this).addClass('active').siblings().removeClass 'active'
        if parent.hasClass('b-header-selector_currency')
          currency = $(this).data 'value'
          App.recalculatePrice currency
      else
        parent.addClass 'active'
        e.preventDefault()

      e.stopPropagation()

    $('html').on "click", ->
      $('.b-header-selector').removeClass  'active'

  recalculatePrice: (currency) ->

    rate = window.data.currencyRate[currency].rate
    title = window.data.currencyRate[currency].title

    $('#results-items .b-hotel-card').each ->
      price = parseInt($(this).data('price'))
      newPrice = Math.ceil((price/rate))
      $(this).find('.b-hotel-card__price').find('.value').text(newPrice).end().find('.currency').text(title)


$ -> App.initialize()
