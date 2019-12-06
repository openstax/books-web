"""Reading Experience highlighting."""

import random

from pages.accounts import Login
from pages.content import Content
from tests import markers
from utils.utility import Highlight


@markers.test_case("C591511")
@markers.parametrize("book_slug,page_slug", [("introductory-statistics", "2-2-histograms-frequency-polygons-and-time-series-graphs")])  # NOQA
@markers.nondestructive
@markers.desktop_only
def test_highlighting_different_content(
        selenium, base_url, book_slug, page_slug, email, password):
    """Highlighting is available when content is selected with the mouse.

    .. note::
       figures do not currently show highlights, but their captions do

    """
    # GIVEN: the Introductory Statistics book section 2.2 is displayed
    # AND: a user is logged in
    # AND: all content is visible
    book = Content(selenium, base_url,
                   book_slug=book_slug, page_slug=page_slug).open()

    book.navbar.click_login()
    Login(selenium).login(email, password)

    if book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    initial_highlight_count = book.content.highlight_count
    total_highlight_count = initial_highlight_count

    # WHEN: any text content is selected with the mouse
    # AND: a highlight color button is clicked
    options = book.content.paragraphs
    paragraph = options[random.randint(0, len(options) - 1)]
    book.content.highlight(paragraph, Highlight.RANDOM)
    new_highlight_count = book.content.highlight_count

    # THEN: the text is highlighted
    assert(new_highlight_count > total_highlight_count), \
        "No new highlight(s) found (text)"
    total_highlight_count = new_highlight_count

    # WHEN: any figure, or figure and caption, is selected with the mouse
    # AND: a highlight color button is clicked
    options = book.content.figures + book.content.figures_and_captions
    figure = options[random.randint(0, len(options) - 1)]
    book.content.highlight(figure, Highlight.ENTIRE)
    new_highlight_count = book.content.highlight_count

    # THEN: the figure or the figure and caption is/are highlighted
    assert(new_highlight_count > total_highlight_count), \
        "No new highlight(s) found (figure)"
    total_highlight_count = new_highlight_count

    # WHEN: any table is selected with the mouse
    # AND: a highlight color button is clicked
    options = book.content.tables
    table = options[random.randint(0, len(options) - 1)]
    book.content.highlight(table, (100, 200))
    new_highlight_count = book.content.highlight_count

    # THEN: the table is highlighted
    assert(new_highlight_count > total_highlight_count), \
        "No new highlight(s) found (table)"
    total_highlight_count = new_highlight_count

    # WHEN: any bulleted or numbered list is selected with the mouse
    # AND: a highlight color button is clicked
    options = book.content.lists
    _list = options[random.randint(0, len(options) - 1)]
    book.content.highlight(_list, Highlight.ENTIRE)
    new_highlight_count = book.content.highlight_count

    # THEN: the list is highlighted
    assert(new_highlight_count > total_highlight_count), \
        "No new highlight(s) found (list)"
    total_highlight_count = new_highlight_count

    # WHEN: any math content is selected with the mouse
    # AND: a highlight color button is clicked
    options = book.content.math
    equation = options[random.randint(0, len(options) - 1)]
    book.content.highlight(equation)
    new_highlight_count = book.content.highlight_count

    # THEN: the math content is highlighted
    assert(new_highlight_count > total_highlight_count), \
        "No new highlight(s) found (math)"
    total_highlight_count = new_highlight_count

    # WHEN: the page is refreshed
    book = book.reload()

    # THEN: all of the preceding hightlights should still be highlighted
    current_highlights = book.content.highlight_count
    assert(current_highlights == total_highlight_count), (
        "Highlight counts do not match: "
        f"found {current_highlights}, expected {total_highlight_count}")
