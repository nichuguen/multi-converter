/**
 *  MAIN APPLICATION
 */
(function($) {
  var inFocus = true;
  
  // Set the focus on textarea
  $('#base-code').focus();
  setTimeout(function () { $('#base-code').focus(); }, 1);

  // Track the focus state
  $('#base-code').on('focus', function() { inFocus = true; });
  $('#base-code').on('focusout', function() { inFocus = false; });

  // Auto-select
  function bindTextareaFocus() {
    $('#results-content textarea').each(function() {
      $(this).on('focus', function(e) {
        this.select();
      });
    });
  }

  // Create shortcut
  $(window).keydown(function(e) {
    if (e.which == 86 && !inFocus) { // V
      $('#convert-submit').click();
    } else if (e.which == 67 && !inFocus) { // C
      $('#reset-btn').click();
    }
  });

  // Hide results header
  $('#results-header').hide();
  // Get input valid formats
  $.getJSON(
    '/static/json/types.json',
    {},
    function(formats, textStatus, jqXHR) {
      $('#formats-controls').empty();
      $.each(formats, function(index, format) {
        var label = $('<label class="radio-inline"></label>');
        var input = $('<input type="radio" required="required" name="input-format" id="input-' + format.id + '" value="' + format.id + '">');
        var html = label.append(input).append(format.name);
        $('#formats-controls').append(html);
      });
    });

  $('#convert-form').on('submit', function(e) {
    e.preventDefault();
    $('#convert-submit').prop('disabled', true);
    $.ajax(
        '/static/json/results.json?' + $('#convert-form').serialize(),
        { dataType: 'json' }
      ).done(function(results) {
        $('#alert-content')
          .empty()
          .prepend($('<div class="alert alert-success" role="alert"><strong>Converted!</strong> input converted correctly!</div>'));

        $('#results-content')
          .empty()
          .loadTemplate("/static/scripts/templates/results.html", results, {
            success: function() {
              bindTextareaFocus();
            }
          });

        $('#results-header').show();
        $('html').animate({
          scrollTop: $("#results-header").offset().top
        }, 500, 'swing', function() {
          $('#results-content textarea')[0].focus();
        });

      }).error(function(jqXHR, textStatus, errorThrown) {
        $('#alert-content')
          .empty()
          .prepend($('<div class="alert alert-danger" role="alert"><strong>Error!</strong> ' + errorThrown + '</div>'));
      }).always(function() {
        $('#convert-submit').prop('disabled', false);
      });
  });

  $('#reset-btn').on('click', function() {
    $('#base-code').focus();
    $('#alert-content').empty();
    setTimeout(function () { $('#convert-form')[0].reset(); }, 1);
    $('#results-content').empty();
    $('#results-header').hide();
  });

})(jQuery);