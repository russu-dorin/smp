$(document).ready(function() {

  $("[data-method='DELETE']").on('click', function() {
    var link = $(this),
        href = link.attr('href'),
        csrfToken = link.data('csrf'),
        form = $('<form method="post" action="' + href + '?_method=delete"></form>'),
        csrfInput = '<input name="_csrf" value="' + csrfToken + '" type="hidden" />';

    form.hide().append(csrfInput).appendTo('body');
    form.submit();
    return false;
  });

});
