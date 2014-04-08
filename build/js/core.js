(function() {
  window.MainPage = (function() {
    var _private;
    _private = {
      setRangeSlider: function() {
        return $("#price-range").ionRangeSlider({
          'type': 'double',
          'min': 500,
          'max': 5000,
          'step': 200,
          'hideMinMax': true,
          'hideFromTo': true,
          onChange: function(obj) {
            var from, to, value;
            value = obj.input[0].value;
            from = value.split(';')[0];
            to = value.split(';')[1];
            $('#price-range-from').val(from);
            return $('#price-range-to').val(to);
          }
        });
      },
      filterSort: function() {
        var list, sortBy, sortDirection, that;
        list = $('#results-items');
        that = this;
        if (list.length) {
          sortBy = 'stars';
          sortDirection = 'down';
          return $('#results-sort').find('.b-results-sort__item').click(function() {
            if (!$(this).hasClass('active')) {
              $(this).addClass('active').siblings().removeClass('active');
            } else {
              sortDirection = (sortDirection === "down" ? "up" : "down");
            }
            $(this).removeClass('down, up').addClass(sortDirection);
            sortBy = $(this).data('sort');
            return that.showHotels(sortBy, sortDirection);
          });
        }
      },
      sortResults: function(list, sortBy, sortDirection, limit) {
        var i, resultList;
        if (sortDirection == null) {
          sortDirection = 'down';
        }
        if (limit == null) {
          limit = 10;
        }
        if (sortBy) {
          list.sort(function(a, b) {
            var aWeight, bWeight;
            aWeight = a[sortBy];
            bWeight = b[sortBy];
            if (sortDirection === 'down') {
              if (aWeight > bWeight) {
                return -1;
              }
              if (aWeight < bWeight) {
                return 1;
              }
            } else {
              if (aWeight < bWeight) {
                return -1;
              }
              if (aWeight > bWeight) {
                return 1;
              }
            }
            return 0;
          });
        }
        resultList = [];
        i = 0;
        while (i < limit) {
          resultList.push(list[i]);
          i++;
        }
        return resultList;
      },
      prepareTemplates: function() {
        var source;
        source = $("#hotel-template").html();
        this.hotel_template = Handlebars.compile(source);
        return Handlebars.registerHelper("ifCond", function(v1, v2, options) {
          if (v1 === v2) {
            return options.fn(this);
          }
          return options.inverse(this);
        });
      },
      showHotels: function(sortBy, sortDirection) {
        var hotels, list;
        if (sortDirection == null) {
          sortDirection = 'down';
        }
        list = $('#results-items');
        hotels = this.getHotels(sortBy, sortDirection, 10);
        return list.html(this.hotel_template({
          'hotels': hotels
        })).find('[data-action=true]').addClass('b-hotel-card_action');
      },
      getHotels: function(sortBy, sortDirection, limit) {
        if (sortDirection == null) {
          sortDirection = 'down';
        }
        if (limit == null) {
          limit = 10;
        }
        return this.sortResults(window.data.hotels, sortBy, sortDirection, limit);
      },
      peopleSelector: function() {
        var decrease, increase;
        increase = function(target) {
          var value;
          value = (parseInt(target.val()) + 1) || 1;
          if (value >= 50) {
            value = 50;
          }
          return target.attr('value', value).change();
        };
        decrease = function(target) {
          var value;
          value = (parseInt(target.val()) - 1) || 0;
          if (value <= 0) {
            value = 0;
            if (target.data('allow-nil') === false) {
              value = 1;
            }
          }
          return target.attr('value', value).change();
        };
        $('#main-search .change').click(function() {
          var target;
          target = $(this).siblings().filter('input');
          if ($(this).hasClass('change_more')) {
            return increase(target);
          } else {
            return decrease(target);
          }
        });
        $('#main-search').on("change", 'input', function(e) {
          var value;
          value = $(e.target).val();
          if (parseInt(value) === 0) {
            return $(e.target).addClass('empty');
          } else {
            return $(e.target).removeClass('empty').attr('value', value);
          }
        });
        return $('#main-search .b-main-search__wrap_people').on("mousewheel DOMMouseScroll", 'input', function(e) {
          var target;
          target = $(e.target);
          if (e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) {
            increase(target);
          } else {
            decrease(target);
          }
          e.stopPropagation();
          return e.preventDefault();
        });
      },
      calendar: function() {
        $('.js-date-from').datepicker({
          changeMonth: true,
          minDate: 0,
          dateFormat: 'd MM',
          onSelect: function(selectedDate, inst) {
            return $('.js-date-to').datepicker("option", "minDate", selectedDate);
          },
          onClose: function(selectedDate) {
            if ($('.js-date-to').val() === '') {
              return $('.js-date-to').datepicker('show');
            }
          }
        });
        return $('.js-date-to').datepicker({
          defaultDate: "+1w",
          changeMonth: true,
          minDate: +1,
          dateFormat: 'd MM',
          onSelect: function(selectedDate, inst) {
            return $('.js-date-from').datepicker("option", "maxDate", selectedDate);
          },
          onClose: function(selectedDate) {
            if ($('.js-date-from').val() === '') {
              return $('.js-date-from').datepicker('show');
            }
          }
        });
      }
    };
    return {
      Map: {
        init: function() {
          if (!window.YMaps) {
            return App.YMInitTimeout = window.setTimeout(this.init, 1000);
          } else {
            return YMaps.load(window.MainPage.Map.showMap);
          }
        },
        showMap: function() {
          var map, point;
          this.map = new YMaps.Map(YMaps.jQuery("#map_canvas")[0]);
          map = this.map;
          map = new YMaps.Map(YMaps.jQuery("#map_canvas")[0]);
          map.setCenter(new YMaps.GeoPoint(37.7, 55.7), 14);
          map.setType(YMaps.MapType.ROADMAP);
          map.addControl(new YMaps.TypeControl());
          map.addControl(new YMaps.ToolBar());
          map.addControl(new YMaps.Zoom());
          map.addControl(new YMaps.ScaleLine());
          map.enableScrollZoom();
          return point = new YMaps.GeoPoint(38.166317, 55.571287);
        }
      },
      init: function() {
        _private.setRangeSlider();
        _private.filterSort();
        _private.peopleSelector();
        _private.calendar();
        _private.prepareTemplates();
        _private.showHotels();
        this.Map.init();
      }
    };
  })();

  $(function() {
    return window.MainPage.init();
  });

}).call(this);

(function() {
  window.App = {
    initialize: function() {
      this.phoneSelector();
      return this.headerSelector();
    },
    phoneSelector: function() {
      var countriesPlace, selector;
      selector = $('#phone-selector');
      if (selector.length) {
        countriesPlace = selector.find('[data-role="countries"]');
        selector.click(function(e) {
          var countries;
          countries = countriesPlace.find('li');
          if (countries.length <= 0) {
            $.each(window.data.contacts, function(index, item) {
              return countriesPlace.append('<li class="b-header-phone-selector__countries__item" data-index="' + index + '">' + item.country + '</li>');
            });
          }
          countriesPlace.show();
          return e.stopPropagation();
        });
        $('html').on("click", function() {
          return countriesPlace.hide();
        });
        return countriesPlace.on("click", 'li', function(e) {
          var data, index;
          index = $(this).addClass('active').siblings().removeClass('active').end().data('index');
          data = window.data.contacts[index].phones;
          $('#header-phones').empty();
          return $.each(data, function(index, item) {
            $('#header-phones').append('<div class="b-header-phones__item"><div class="b-header-phones__item__value">' + item.value + '</div><div class="b-header-phones__item__desc">' + item.desc + '</div></div>');
            countriesPlace.hide();
            return e.stopPropagation();
          });
        });
      }
    },
    headerSelector: function() {
      $('.b-header-selector__item').click(function(e) {
        var currency, parent;
        parent = $(this).closest('.b-header-selector');
        parent.siblings().removeClass('active');
        if (parent.hasClass('active')) {
          parent.removeClass('active');
          $(this).addClass('active').siblings().removeClass('active');
          if (parent.hasClass('b-header-selector_currency')) {
            currency = $(this).data('value');
            App.recalculatePrice(currency);
          }
        } else {
          parent.addClass('active');
          e.preventDefault();
        }
        return e.stopPropagation();
      });
      return $('html').on("click", function() {
        return $('.b-header-selector').removeClass('active');
      });
    },
    recalculatePrice: function(currency) {
      var rate, title;
      rate = window.data.currencyRate[currency].rate;
      title = window.data.currencyRate[currency].title;
      return $('#results-items .b-hotel-card').each(function() {
        var newPrice, price;
        price = parseInt($(this).data('price'));
        newPrice = Math.ceil(price / rate);
        return $(this).find('.b-hotel-card__price').find('.value').text(newPrice).end().find('.currency').text(title);
      });
    }
  };

  $(function() {
    return App.initialize();
  });

}).call(this);
