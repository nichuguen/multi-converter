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

  // Droppable area
  $('#droppable-result').droppable({
    activeClass: 'droppable-result-highlight',
    accept: '.result-panel',
    tolerance: 'touch',
    drop: function(e, ui) {
      var result = ui.draggable;
      $(result)
        .draggable('destroy')
        .css({
          left: 0,
          top: 0,
          position: 'relative'
        })
        .toggleClass('col-sm-6')
        .addClass('full-width')
        .detach();
      $(result).find('.panel')
        .removeClass('panel-default')
        .addClass('panel-info')
        .find('.panel-title')
        .loadTemplate("/static/scripts/templates/close.html", {}, {
          overwriteCache: true,
          append: true,
          success: function() {
            $(this).on('click', function() {
              $(this).parents('.result-panel').remove();
              reloadPipeline();
            });
          }
        });
      $(result).find('textarea')
        .attr('disabled','disabled');
      $('#piping-result')
        .append(result);
      reloadPipeline();
    }
  });

  // Create shortcut
  var cmd = false;
  $(window).keydown(function(e) {
    // cmd = 224 & ctrl = 17
    if (e.which == 224 || e.which == 17) {
      cmd = true;
    } else if (e.which == 86 && !inFocus && !cmd) { // V
      $('#convert-submit').click();
    } else if (e.which == 67 && !inFocus && !cmd) { // C
      $('#reset-btn').click();
    }
  });
  $(window).keyup(function(e) {
    if (e.which == 224 || e.which == 17) {
      cmd = false;
    }
  });

  // Hide stuff
  $('#results-header').hide();
  $('#droppable-result').hide();
  // Get input valid formats
  $.getJSON(
    '/static/json/types.json',
    {},
    function(formats, textStatus, jqXHR) {
      $('#formats-controls')
        .loadTemplate("/static/scripts/templates/label.html", formats);
    });

  $('#convert-form').on('submit', function(e) {
    e.preventDefault();
    $('#convert-submit').prop('disabled', true);
    $('input[name=input-format]').prop('disabled', true);
    $('#base-code').attr('disabled','disabled');
    reloadPipeline();
  });

  $('#reset-btn').on('click', function() {
    $('#base-code').focus();
    $('#alert-content').empty();
    $('#piping-result').empty();
    $('#results-content').empty();
    $('#results-header').hide();
    $('#droppable-result').hide();
    $('input[name=input-format]').prop('disabled', false);
    $('#base-code').removeAttr('disabled');
    setTimeout(function () { $('#convert-form')[0].reset(); }, 1);
  });

  // Reload the pipeline
  function reloadPipeline() {
    // Construct the pipeline
    var pipeline = [];
    $('#piping-result textarea').each(function(index, textarea) {
      var ecodeId = $(textarea)
        .parents('.result-panel')
        .attr('data-id');
      var step = {
        step: index,
        ecodeId: parseInt(ecodeId),
      };
      pipeline.push(step);
    });
    console.log(pipeline);

    // TODO
    // - get the original format
    // - get the input value
    // - code with input and format
    // - update res array
    // - if pipeline > 0
    //   - for each step
    //     - code with the previous output and current format
    //     - update res array
    // - update result UI with res array

    $.ajax(
        '/static/json/results.json?' + $('#convert-form').serialize(),
        { dataType: 'json' }
      ).done(function(results) {
        $('#alert-content')
          .loadTemplate("/static/scripts/templates/message.html", {
            classes: 'alert alert-success',
            title: 'Converted!',
            message: 'input converted correctly!'
          });
        $('#results-content')
          .empty()
          .loadTemplate("/static/scripts/templates/results.html", results, {
            success: function() {
              bindEventOnResult();
            }
          });
        $('#results-header').show();
        $('#droppable-result').show();
        $('html').animate({
          scrollTop: $("#results-header").offset().top
        }, 500, 'swing', function() {
          $('#results-content textarea')[0].focus();
        });

      }).error(function(jqXHR, textStatus, errorThrown) {
        $('#alert-content')
          .loadTemplate("/static/scripts/templates/message.html", {
            classes: 'alert alert-danger',
            title: 'Error!',
            message: errorThrown
          });
      }).always(function() {
        $('#convert-submit').prop('disabled', false);
      });
  }

  // Auto-select
  function bindEventOnResult() {
    $('#results-content textarea').each(function() {
      $(this).on('focus', function(e) { this.select(); });
      $(this).on('onselectstart', function(e) { return false; });
    });
    $('#results-content .result-panel').each(function() {
      $(this).draggable({
        zIndex: 100,
        revert: 'invalid',
        revertDuration: 0,
        snap: true,
        snapMode: 'inner',
        start: function(event, ui) {
          $(this).find('.panel')
            .removeClass('panel-default')
            .addClass('panel-primary');
        },
        stop: function(event, ui) {
          $(this).find('.panel')
            .removeClass('panel-primary')
            .addClass('panel-default');
        }
      });
    });
  }

})(jQuery);