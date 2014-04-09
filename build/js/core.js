(function() {
  window.MainPage = (function() {
    var _private;
    _private = {
      filterObject: {},
      sortObject: {
        sortBy: null,
        sortDirection: 'down'
      },
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
            $('#price-range-from').val(from).change();
            return $('#price-range-to').val(to).change();
          }
        });
      },
      filterSort: function() {
        var list, sortBy, sortDirection, that;
        list = $('#results-items');
        that = this;
        sortBy = 'stars';
        sortDirection = 'down';
        return $('#results-sort').find('.b-results-sort__item').click(function() {
          if (!$(this).hasClass('active')) {
            $(this).addClass('active').siblings().removeClass('active');
          } else {
            sortDirection = (sortDirection === "down" ? "up" : "down");
          }
          $(this).removeClass('down, up').addClass(sortDirection);
          that.sortObject.sortBy = $(this).data('sort');
          that.sortObject.sortDirection = sortDirection;
          return that.showHotels();
        });
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
      showHotels: function() {
        var hotels, list;
        list = $('#results-items');
        hotels = this.getHotels(10);
        return list.html(this.hotel_template({
          'hotels': hotels
        })).find('[data-action=true]').addClass('b-hotel-card_action');
      },
      getHotels: function(limit) {
        var filterObject, filteredHotels, hotels, i, sortObject, sortedHotels;
        if (limit == null) {
          limit = 10;
        }
        hotels = window.data.hotels;
        filterObject = this.filterObject;
        sortObject = this.sortObject;
        filteredHotels = [];
        sortedHotels = [];
        hotels.forEach(function(hotel) {
          var isMatching, key;
          isMatching = true;
          for (key in filterObject) {
            if (key === 'price-range-from' && filterObject[key].length) {
              if (parseInt(hotel.price, 10) < parseInt(filterObject[key][0], 10)) {
                isMatching = false;
              }
            }
            if (key === 'price-range-to' && filterObject[key].length) {
              if (parseInt(hotel.price, 10) > parseInt(filterObject[key][0], 10)) {
                isMatching = false;
              }
            }
            if (key === 'title' && filterObject[key].length && filterObject[key][0].length > 3) {
              if (hotel.title.toLowerCase().indexOf(filterObject[key][0].toLowerCase()) < 0) {
                isMatching = false;
              }
            }
            if (key === 'stars' && filterObject[key].length) {
              if (filterObject[key].indexOf(hotel.stars.toString()) < 0) {
                isMatching = false;
              }
            }
            if (key === 'distance' && filterObject[key].length) {
              if (parseInt(filterObject[key], 10) > parseInt(hotel.distance) + 5 || parseInt(filterObject[key]) < parseInt(hotel.distance) - 5) {
                isMatching = false;
              }
            }
            if (key === 'score' && filterObject[key].length && filterObject[key][0] !== '0') {
              if (filterObject[key][0] !== hotel.score.replace(/\s/, '+')) {
                isMatching = false;
              }
            }
          }
          if (isMatching) {
            return filteredHotels.push(hotel);
          }
        });
        if (sortObject.sortBy) {
          filteredHotels.sort(function(a, b) {
            var aWeight, bWeight;
            aWeight = a[sortObject.sortBy];
            bWeight = b[sortObject.sortBy];
            if (sortObject.sortDirection === 'down') {
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
        i = 0;
        while (i < filteredHotels.length && i < limit) {
          sortedHotels.push(filteredHotels[i]);
          i++;
        }
        return sortedHotels;
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
      },
      deparam: function(query) {
        var i, key, keyValuePair, map, pairs, value;
        if (query.slice(0, 1) === "?") {
          query = query.slice(1);
        }
        map = {};
        if (query !== "") {
          pairs = query.split("&");
          i = 0;
          while (i < pairs.length) {
            keyValuePair = pairs[i].split("=");
            key = decodeURIComponent(keyValuePair[0]);
            value = (keyValuePair.length > 1 ? decodeURIComponent(keyValuePair[1]) : undefined);
            if (!map[key]) {
              map[key] = [];
            }
            map[key].push(value);
            i += 1;
          }
        }
        return map;
      },
      listenFilter: function() {
        return $('#filter').on('change', 'input, select', (function(_this) {
          return function() {
            if (_this.timer) {
              clearTimeout(_this.timer);
            }
            return _this.timer = setTimeout(function() {
              _this.filterObject = _this.deparam($('#filter').serialize());
              _this.showHotels();
            }, 500);
          };
        })(this));
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
        _private.listenFilter();
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
            console.log('xxx');
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
        return $(this).find('.b-hotel-card__buy__price').find('.value').text(newPrice).end().find('.currency').text(title);
      });
    }
  };

  $(function() {
    return App.initialize();
  });

}).call(this);
