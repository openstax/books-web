"""Reading Experience highlighting."""

import logging
import random
from math import isclose
from time import sleep

from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys

from pages.accounts import Signup
from pages.content import Content
from tests import markers
from tests.conftest import DESKTOP
from utils.utility import Highlight, Utilities


@markers.test_case("C592636")
@markers.highlighting
@markers.parametrize("book_slug, page_slug", [("chemistry-2e", "1-introduction")])
# @markers.smoke_test
def test_my_highlights_summary_shows_highlights_and_notes_on_current_page(
    selenium, base_url, book_slug, page_slug
):
    """My Highlights and Notes summary shows page highlights and notes."""
    # SETUP:
    ONE, TWO, THREE, FOUR = range(4)
    color = Highlight.random_color
    highlight_ids = [""] * 4
    highlight_colors = [color(), color(), color(), color()]
    highlight_notes = ["", Utilities.random_string(), "", Utilities.random_string()]
    highlight_partial_text = [""] * 4
    chapter_one = ("1", "Essential Ideas")
    sections = [("", "Introduction"), ("1.1", "Chemistry in Context")]

    # GIVEN: the Chemistry 2e book section 1.0 is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   some content is highlighted without a note
    # AND:   some content is highlighted with a note
    # AND:   some content is highlighted in section 1.1 without a note
    # AND:   some content is highlighted in section 1.1 with a note
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email, password = Signup(selenium).register(True)

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    # making a highlight requires a non-mobile window width temporarily
    width, height = book.get_window_size()
    if width <= DESKTOP[0]:
        selenium.set_window_size(width=DESKTOP[0], height=height)

    paragraphs = random.sample(book.content.paragraphs, 2)
    book.content.highlight(
        target=paragraphs[0], offset=Highlight.ENTIRE, color=highlight_colors[ONE]
    )
    highlight_ids[ONE] = book.content.highlight_ids[0]
    highlight_partial_text[ONE] = book.content.get_highlight(by_id=highlight_ids[ONE])[0].text

    book.content.highlight(
        target=paragraphs[1],
        offset=Highlight.ENTIRE,
        color=highlight_colors[TWO],
        note=highlight_notes[TWO],
    )
    page_highlight_ids = book.content.highlight_ids
    highlight_ids[TWO] = (
        page_highlight_ids[1]
        if highlight_ids[ONE] == page_highlight_ids[0]
        else page_highlight_ids[0]
    )
    highlight_partial_text[TWO] = book.content.get_highlight(by_id=highlight_ids[TWO])[0].text

    book.click_next_link()

    paragraphs = random.sample(book.content.paragraphs, 2)
    book.content.highlight(
        target=paragraphs[0], offset=Highlight.ENTIRE, color=highlight_colors[THREE]
    )
    highlight_ids[THREE] = book.content.highlight_ids[0]
    highlight_partial_text[THREE] = book.content.get_highlight(by_id=highlight_ids[THREE])[0].text

    book.content.highlight(
        target=paragraphs[1],
        offset=Highlight.ENTIRE,
        color=highlight_colors[FOUR],
        note=highlight_notes[FOUR],
    )
    page_highlight_ids = book.content.highlight_ids
    highlight_ids[FOUR] = (
        page_highlight_ids[1]
        if highlight_ids[THREE] == page_highlight_ids[0]
        else page_highlight_ids[0]
    )
    highlight_partial_text[FOUR] = book.content.get_highlight(by_id=highlight_ids[FOUR])[0].text

    if width != DESKTOP[0]:
        # reset the window width for a mobile test
        selenium.set_window_size(width=width, height=height)

    # WHEN: they click on the My highlights button
    my_highlights = book.toolbar.my_highlights()

    # THEN: the My Highlights and Notes modal is displayed
    # AND:  sections without highlights are not included in the placeholders
    # AND:  all highlights for the chapter are displayed
    # AND:  each highlight color matches the corresponding page highlight color
    # AND:  each note matches the corresponding page highlight note
    assert book.my_highlights_open, "My Highlights modal not open"
    assert my_highlights.root.is_displayed(), "My Highlights modal not displayed"

    assert (
        len(my_highlights.highlights.chapters) == 1
    ), "chapter heading not displayed in the highlights summary"
    highlight_chapter = (
        my_highlights.highlights.chapters[0].number,
        my_highlights.highlights.chapters[0].title,
    )
    assert highlight_chapter == chapter_one, "chapter number and title do not match in the summary"
    assert len(my_highlights.highlights.sections) == 2, "did not find two section headings"
    highlight_sections = [
        (section.number, section.title) for section in my_highlights.highlights.sections
    ]
    assert set(highlight_sections) == set(sections), "mismatched section numbers and/or names"

    current_summary_highlights = len(my_highlights.all_highlights)
    assert current_summary_highlights == len(highlight_ids), (
        "unexpected number of highlights found on the summary page ("
        f"found {current_summary_highlights}, expected {len(highlight_ids)})"
    )

    # ordering could be in sequence or reversed so check against both section
    # highlights
    for index, highlight in enumerate(my_highlights.all_highlights):
        option_1, option_2 = (ONE, TWO) if index <= TWO else (THREE, FOUR)
        assert (
            highlight.color == highlight_colors[option_1]
            or highlight.color == highlight_colors[option_2]
        ), f"highlight color for highlight {index + 1} does not match"

        content = highlight.content
        assert (
            highlight_partial_text[option_1] in content
            or highlight_partial_text[option_2] in content
        ), f"partial note text not found in summary highlight {index + 1}"

        # currently the summary trims extra spaces and removes carriage returns
        note_1 = highlight_notes[option_1].replace("\n", " ").replace("  ", " ")
        note_2 = highlight_notes[option_2].replace("\n", " ").replace("  ", " ")
        assert (
            highlight.note == note_1 or highlight.note == note_2
        ), f"highlight note {index + 1} does not match content note"


@markers.test_case("C592637")
@markers.highlighting
@markers.parametrize("book_slug, page_slug", [("chemistry-2e", "1-4-measurements")])
def test_my_highlights_summary_shows_all_types_of_content(selenium, base_url, book_slug, page_slug):
    """My Highlights and Notes summary shows all types of page content."""
    # GIVEN: the Chemistry 2e book section 1.4 is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   a long text paragraph, an image, a figure description, a bulleted
    #        or numbered list, a table, a footnote, a link, and a rendered math
    #        equation are highlighted
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email, password = Signup(selenium).register(True)
    logging.info(f'"{email.address}":"{password}"')

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    # making a highlight requires a non-mobile window width temporarily
    width, height = book.get_window_size()
    if width <= DESKTOP[0]:
        selenium.set_window_size(width=DESKTOP[0], height=height)

    Highlight.force_highlight(
        book=book,
        by=random.choice,
        group=book.content.paragraphs,
        offset=Highlight.ENTIRE,
        color=Highlight.random_color(),
        name="Paragraph",
    )
    Highlight.force_highlight(
        book=book,
        by=random.choice,
        group=book.content.images,
        offset=Highlight.ENTIRE,
        color=Highlight.random_color(),
        name="Image",
    )
    Highlight.force_highlight(
        book=book,
        by=random.choice,
        group=book.content.figures,
        offset=Highlight.ENTIRE,
        color=Highlight.random_color(),
        name="Figure",
    )
    Highlight.force_highlight(
        book=book,
        by=random.choice,
        group=book.content.captions,
        offset=Highlight.ENTIRE,
        color=Highlight.random_color(),
        name="Caption",
    )
    Highlight.force_highlight(
        book=book,
        by=random.choice,
        group=book.content.lists,
        offset=Highlight.ENTIRE,
        color=Highlight.random_color(),
        name="List",
    )
    Highlight.force_highlight(
        book=book,
        by=random.choice,
        group=book.content.tables,
        offset=Highlight.ENTIRE,
        color=Highlight.random_color(),
        name="Table",
    )
    Highlight.force_highlight(
        book=book,
        by=random.choice,
        group=book.content.footnotes,
        offset=Highlight.ENTIRE,
        color=Highlight.random_color(),
        name="Footnote",
    )
    Highlight.force_highlight(
        book=book,
        by=random.choice,
        group=book.content.links,
        offset=Highlight.ENTIRE,
        color=Highlight.random_color(),
        name="Link",
    )
    Highlight.force_highlight(
        book=book,
        by=random.choice,
        group=book.content.math,
        offset=Highlight.ENTIRE,
        color=Highlight.random_color(),
        name="Math",
    )
    highlight_ids = set(book.content.highlight_ids)

    if width != DESKTOP[0]:
        # reset the window width for a mobile test
        selenium.set_window_size(width=width, height=height)

    # WHEN: they click on the My highlights button
    my_highlights = book.toolbar.my_highlights()

    # THEN: the My Highlights and Notes modal is displayed
    # AND:  all of the highlighted content is displayed in the summary page
    assert book.my_highlights_open, "My Highlights modal not open"
    assert my_highlights.root.is_displayed(), "My Highlights modal not displayed"

    summary_highlights = len(my_highlights.all_highlights)
    assert summary_highlights == len(highlight_ids), (
        "number of summary highlights different from page highlights "
        f"(found {summary_highlights}, expected {len(highlight_ids)})"
    )


@markers.test_case("C592640")
@markers.desktop_only
@markers.highlighting
@markers.parametrize("book_slug, page_slug", [("chemistry-2e", "1-introduction")])
def test_able_to_close_my_highlights_with_keyboard_navigation(
    selenium, base_url, book_slug, page_slug
):
    """My Highlights and Notes summary shows all types of page content."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   the My Highlights and Notes modal is open
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email, password = Signup(selenium).register(True)

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    book.toolbar.my_highlights()

    # WHEN: they tab to the close 'x' and send the return key to it
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys(Keys.RETURN).perform())

    # THEN: the My Highlights and Notes modal is closed
    assert not book.my_highlights_open, "My Highlights and Notes modal is still open"


@markers.test_case("C592641")
@markers.highlighting
@markers.parametrize("book_slug, page_slug", [("chemistry-2e", "1-1-chemistry-in-context")])
def test_lengthy_highlights_summary_page_has_a_floating_back_to_top_link(
    selenium, base_url, book_slug, page_slug
):
    """My Highlights and Notes summary has a floating back to top button."""
    # GIVEN: a book section is displayed
    # AND:   a user is logged in
    # AND:   all content is visible
    # AND:   several sections are highlighted
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email, password = Signup(selenium).register(True)
    logging.info(f'"{email.address}":"{password}"')

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    # making a highlight requires a non-mobile window width temporarily
    width, height = book.get_window_size()
    if width <= DESKTOP[0]:
        selenium.set_window_size(width=DESKTOP[0], height=height)

    for _ in range(10):
        Highlight.force_highlight(
            book=book,
            by=random.choice,
            group=book.content.paragraphs,
            offset=Highlight.ENTIRE,
            color=Highlight.random_color(),
        )

    if width != DESKTOP[0]:
        # reset the window width for a mobile test
        selenium.set_window_size(width=width, height=height)

    # WHEN: they open the highlights summary modal
    # AND:  the modal is scrolled down
    my_highlights = book.toolbar.my_highlights()
    initial_scroll_top = my_highlights.scroll_position
    within = max(initial_scroll_top * 0.01, 10.0)

    Utilities.scroll_to(selenium, element=my_highlights.all_highlights[-1].root)
    sleep(0.33)

    # THEN: a floating back to top button is displayed in the lower right
    #       side of the modal
    assert my_highlights.scroll_position > initial_scroll_top, "modal not scrolled down"
    assert my_highlights.back_to_top_available, "back to top button not found"

    # WHEN: they click the back to top button
    my_highlights = my_highlights.back_to_top()

    # THEN: the modal is scrolled to the top
    # AND:  the back to top button is not available
    return_position = my_highlights.scroll_position
    assert isclose(return_position, initial_scroll_top, rel_tol=within), (
        r"return scroll position not within 1% of the initial scroll position "
        "({low} <= {target} <= {high})".format(
            low=initial_scroll_top - within,
            high=initial_scroll_top + within,
            target=return_position,
        )
    )

    assert not my_highlights.back_to_top_available, "back to top button still available"
