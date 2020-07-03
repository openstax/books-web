import random

import pytest
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By

from pages.accounts import Signup
from tests import markers
from pages.osweb import WebBase
from pages.content import Content
from utils.utility import Highlight, Utilities
from utils import utility

HAS_INDICATOR = (
    "return window.getComputedStyle(arguments[0], ':after').getPropertyValue('opacity') == '0.8';"
)
XPATH_SEARCH = "//span[contains(text(),'{term}') and contains(@class,'highlight')]"


@markers.test_case("C602210")
@markers.desktop_only
@markers.parametrize("book_slug,page_slug", [("microbiology", "4-introduction")])
def test_modal_for_unsaved_notes_appears_on_clicking_another_highlight(
    selenium, base_url, book_slug, page_slug
):
    """Discard modal appears when unsaved notes are present & clicking another highlight."""
    # GIVEN: Login book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()
    book.content.show_solutions()

    # AND: Highlight 2 paragraphs
    paragraphs = random.sample(book.content.paragraphs, 2)
    book.content.highlight(target=paragraphs[0], offset=Highlight.ENTIRE)
    id_1 = list(set(book.content.highlight_ids))[0]

    book.content.highlight(target=paragraphs[1], offset=Highlight.ENTIRE, close_box=False)
    _ids = book.content.highlight_ids
    id_2 = _ids[0] if _ids[0] != id_1 else _ids[1]

    # AND: Add note to the 2nd highlight and do not save
    note = Utilities.random_string()
    book.content.highlight_box.note = note

    # WHEN: click the first highlight
    highlight = book.content.get_highlight(by_id=id_1)
    Utilities.click_option(driver=selenium, element=highlight[0], scroll_to=-150)

    # THEN: Discard modal is displayed
    assert book.discard_changes_modal_displayed
    assert book.discard_modal.content == "You have an unsaved note on this page."
    assert book.discard_modal.title == "Discard unsaved changes?"

    # AND: Clicking Cancel closes the modal and the unsaved note is retained in the page
    book.discard_modal.click_cancel_changes()

    assert book.content.highlight_box.is_open, "Highlight box not open"
    assert book.content.highlight_box.is_edit_box
    highlight = book.content.get_highlight(by_id=id_2)[0]
    assert "focus" in highlight.get_attribute("class"), "highlight is not in focus"
    assert book.content.highlight_box.note == note

    # WHEN: click the 1st highlight again
    highlight = book.content.get_highlight(by_id=id_1)
    Utilities.click_option(driver=selenium, element=highlight[0], scroll_to=-150)

    # AND: click Discard changes  in the modal
    book.discard_modal.click_discard_changes()

    # THEN: Unsaved note is abandoned and the highlight box is opened for the 1st highlight
    assert book.content.highlight_box.is_open, "Highlight box not open"
    highlight = book.content.get_highlight(by_id=id_1)[0]
    assert "focus" in highlight.get_attribute("class"), "highlight is not in focus"
    assert book.content.highlight_box.note == ""


@markers.test_case("C602211")
@markers.desktop_only
@markers.parametrize("book_slug,page_slug", [("microbiology", "1-introduction")])
def test_modal_for_unsaved_notes_appears_on_page_navigation_using_toc(
    selenium, base_url, book_slug, page_slug
):
    """Discard modal appears when unsaved notes are present & clicking TOC link."""
    # GIVEN: Login book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    toc = book.sidebar.toc

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()

    # AND: Highlight a paragraph, add a note & do not save
    paragraphs = random.sample(book.content.paragraphs, 1)
    book.content.highlight(target=paragraphs[0], offset=Highlight.ENTIRE, close_box=False)
    note = Utilities.random_string()
    book.content.highlight_box.note = note

    highlight_id = book.content.highlight_ids[0]

    # WHEN: Click on a TOC link
    book.offscreen_click(toc.sections[3].root)

    # THEN: Discard modal is displayed
    assert book.discard_changes_modal_displayed
    assert book.discard_modal.content == "You have an unsaved note on this page."
    assert book.discard_modal.title == "Discard unsaved changes?"

    # WHEN: Click Cancel on the modal
    book.discard_modal.click_cancel_changes()

    # THEN: The modal is closed and the unsaved note is retained on the page
    assert book.content.highlight_box.is_open, "Highlight box not open"
    assert book.content.highlight_box.is_edit_box
    highlight = book.content.get_highlight(by_id=highlight_id)[0]
    assert "focus" in highlight.get_attribute("class"), "highlight is not in focus"
    assert book.content.highlight_box.note == note

    # WHEN: Click the TOC link again
    book.offscreen_click(toc.sections[3].root)

    # AND: click Discard changes in the modal
    book.discard_modal.click_discard_changes()
    book.wait_for_page_to_load()

    # THEN: New page is loaded
    assert toc.sections[3].is_active

    # AND: No highlight box is open in the new page
    with pytest.raises(NoSuchElementException) as e:
        book.content.highlight_box
    assert "No open highlight boxes found" in str(e.value), "highlight box is open in the new page"

    # AND: No existing highlights present in the new page
    try:
        assert not book.content.highlights
    except NoSuchElementException:
        pytest.fail("existing highlight present in the page")

    # WHEN: Navigate back to the initial page
    toc.sections[1].click()
    book.wait_for_page_to_load()

    # THEN: The unsaved note in the initial page is not saved
    highlight = book.content.get_highlight(by_id=highlight_id)[0]
    assert not selenium.execute_script(HAS_INDICATOR, highlight), "note is saved for the highlight"


@markers.test_case("C606115")
@markers.desktop_only
@markers.parametrize("book_slug,page_slug", [("microbiology", "1-introduction")])
def test_modal_for_unsaved_notes_appears_on_page_navigation_using_prev_link(
    selenium, base_url, book_slug, page_slug
):
    """Discard modal appears when unsaved notes are present & clicking previous link."""
    # GIVEN: Login book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    toc = book.sidebar.toc

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()

    # AND: Highlight a paragraph, add a note & do not save
    paragraphs = random.sample(book.content.paragraphs, 1)
    book.content.highlight(target=paragraphs[0], offset=Highlight.ENTIRE, close_box=False)
    note = Utilities.random_string()
    book.content.highlight_box.note = note

    highlight_id = book.content.highlight_ids[0]

    # WHEN: Click previous link
    book.offscreen_click(book.previous_link)

    # THEN: Discard modal is displayed
    assert book.discard_changes_modal_displayed
    assert book.discard_modal.content == "You have an unsaved note on this page."
    assert book.discard_modal.title == "Discard unsaved changes?"

    # WHEN: Click Cancel on the modal
    book.discard_modal.click_cancel_changes()

    # THEN: The modal is closed and the unsaved note is retained on the page
    assert book.content.highlight_box.is_open, "Highlight box not open"
    assert book.content.highlight_box.is_edit_box
    highlight = book.content.get_highlight(by_id=highlight_id)[0]
    assert "focus" in highlight.get_attribute("class"), "highlight is not in focus"
    assert book.content.highlight_box.note == note

    # WHEN: Click previous link again
    book.offscreen_click(book.previous_link)

    # AND: click Discard changes in the modal
    book.discard_modal.click_discard_changes()
    book.wait_for_page_to_load()

    # THEN: New page is loaded
    assert toc.sections[0].is_active

    # AND: No highlight box is open in the new page
    with pytest.raises(NoSuchElementException) as e:
        book.content.highlight_box
    assert "No open highlight boxes found" in str(e.value), "highlight box is open in the new page"

    # AND: No existing highlights present in the new page
    try:
        assert not book.content.highlights
    except NoSuchElementException:
        pytest.fail("existing highlight present in the page")

    # WHEN: Navigate back to the initial page
    book.click_next_link()

    # THEN: The unsaved note in the initial page is not saved
    highlight = book.content.get_highlight(by_id=highlight_id)[0]
    assert not selenium.execute_script(HAS_INDICATOR, highlight), "note is saved for the highlight"


@markers.test_case("C606116")
@markers.desktop_only
@markers.parametrize("book_slug,page_slug", [("microbiology", "1-introduction")])
def test_modal_for_unsaved_notes_appears_on_page_navigation_using_next_link(
    selenium, base_url, book_slug, page_slug
):
    """Discard modal appears when unsaved notes are present & clicking next link."""
    # GIVEN: Login book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    toc = book.sidebar.toc

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()

    # AND: Highlight a paragraph, add a note & do not save
    paragraphs = random.sample(book.content.paragraphs, 1)
    book.content.highlight(target=paragraphs[0], offset=Highlight.ENTIRE, close_box=False)
    note = Utilities.random_string()
    book.content.highlight_box.note = note

    highlight_id = book.content.highlight_ids[0]

    # WHEN: Click next link
    book.offscreen_click(book.next_link)

    # THEN: Discard modal is displayed
    assert book.discard_changes_modal_displayed
    assert book.discard_modal.content == "You have an unsaved note on this page."
    assert book.discard_modal.title == "Discard unsaved changes?"

    # WHEN: Click Cancel on the modal
    book.discard_modal.click_cancel_changes()

    # THEN: The modal is closed and the unsaved note is retained on the page
    assert book.content.highlight_box.is_open, "Highlight box not open"
    assert book.content.highlight_box.is_edit_box
    highlight = book.content.get_highlight(by_id=highlight_id)[0]
    assert "focus" in highlight.get_attribute("class"), "highlight is not in focus"
    assert book.content.highlight_box.note == note

    # WHEN: Click next link again
    book.offscreen_click(book.next_link)

    # AND: click Discard changes in the modal
    book.discard_modal.click_discard_changes()
    book.wait_for_page_to_load()

    # THEN: New page is loaded
    assert toc.sections[2].is_active

    # AND: No highlight box is open in the new page
    with pytest.raises(NoSuchElementException) as e:
        book.content.highlight_box
    assert "No open highlight boxes found" in str(e.value), "highlight box is open in the new page"

    # AND: No existing highlights present in the new page
    try:
        assert not book.content.highlights
    except NoSuchElementException:
        pytest.fail("existing highlight present in the page")

    # WHEN: Navigate back to the initial page
    book.click_previous_link()

    # THEN: The unsaved note in the initial page is not saved
    highlight = book.content.get_highlight(by_id=highlight_id)[0]
    assert not selenium.execute_script(HAS_INDICATOR, highlight), "note is saved for the highlight"


@markers.test_case("C602213")
@markers.desktop_only
@markers.parametrize("book_slug,page_slug", [("microbiology", "1-introduction")])
def test_modal_for_unsaved_notes_appears_on_clicking_book_title(
    selenium, base_url, book_slug, page_slug
):
    """Discard modal appears when unsaved notes are present & book title is clicked."""
    # GIVEN: Login book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    book_banner = book.bookbanner

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()

    # AND: Highlight a paragraph, add a note & do not save
    paragraphs = random.sample(book.content.paragraphs, 1)
    book.content.highlight(target=paragraphs[0], offset=Highlight.ENTIRE, close_box=False)
    note = Utilities.random_string()
    book.content.highlight_box.note = note
    highlight_id = book.content.highlight_ids[0]

    # WHEN: Click on book title
    book_banner.book_title.click()

    # THEN: Discard modal is displayed
    assert book.discard_changes_modal_displayed
    assert book.discard_modal.content == "You have an unsaved note on this page."
    assert book.discard_modal.title == "Discard unsaved changes?"

    # WHEN: Click Cancel on the modal
    book.discard_modal.click_cancel_changes()

    # THEN: The modal is closed and the unsaved note is retained on the page
    assert book.content.highlight_box.is_open, "Highlight box not open"
    assert book.content.highlight_box.is_edit_box
    highlight = book.content.get_highlight(by_id=highlight_id)[0]
    assert "focus" in highlight.get_attribute("class"), "highlight is not in focus"
    assert book.content.highlight_box.note == note

    # WHEN: Click on book title again
    book_banner.book_title.click()

    # AND: click Discard changes in the modal
    book.discard_modal.click_discard_changes()

    # THEN: The page navigates to osweb book details page
    osweb = WebBase(selenium)
    osweb.wait_for_page_to_load()
    expected_page_url = base_url + "/details/books/" + book_slug
    assert expected_page_url == osweb.current_url

    # WHEN: Click the view online link in osweb book detail page
    osweb.click_view_online()

    # THEN: The unsaved note in the initial page is not saved
    highlight = book.content.get_highlight(by_id=highlight_id)[0]
    assert not selenium.execute_script(HAS_INDICATOR, highlight), "note is saved for the highlight"

    # AND: No highlight box is open in the page
    with pytest.raises(NoSuchElementException) as e:
        book.content.highlight_box
    assert "No open highlight boxes found" in str(e.value), "highlight box is open in the page"


@markers.test_case("C602209")
@markers.desktop_only
@markers.parametrize("book_slug,page_slug", [("microbiology", "4-introduction")])
def test_modal_for_unsaved_notes_appears_on_selecting_new_text(
    selenium, base_url, book_slug, page_slug
):
    """Discard modal appears when unsaved notes are present & selecting new text."""
    # GIVEN: Login book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()

    # WHEN: Highlight a paragraph, add a note & do not save
    paragraph = random.sample(book.content.paragraphs, 2)
    book.content.highlight(target=paragraph[0], offset=Highlight.ENTIRE, close_box=False)
    note = Utilities.random_string()
    book.content.highlight_box.note = note
    id_1 = book.content.highlight_ids[0]

    # AND: Select some text in the page
    book.content.select(target=paragraph[1], offset=Highlight.ENTIRE)

    # THEN: Discard modal is displayed
    assert book.discard_changes_modal_displayed
    assert book.discard_modal.content == "You have an unsaved note on this page."
    assert book.discard_modal.title == "Discard unsaved changes?"

    # WHEN: Click Cancel
    book.discard_modal.click_cancel_changes()

    # THEN: The modal is closed and the unsaved note is retained in the page
    assert book.content.highlight_box.is_open, "Highlight box not open"
    assert book.content.highlight_box.is_edit_box
    highlight = book.content.get_highlight(by_id=id_1)[0]
    assert "focus" in highlight.get_attribute("class"), "highlight is not in focus"
    assert book.content.highlight_box.note == note

    # WHEN: Select some text in the page again
    book.content.select(target=paragraph[1], offset=Highlight.ENTIRE)

    # AND: Click Discard changes in the modal
    book.discard_modal.click_discard_changes()

    # THEN: The new text is selected
    selected_text = selenium.execute_script("return window.getSelection().toString()")
    assert selected_text == paragraph[1].get_attribute("textContent")

    # AND: The highlight box is opened for the selected text
    assert book.content.highlight_box.is_open, "Highlight box not open"
    assert book.content.highlight_box.note == ""

    # AND: The selected text is not a saved highlight
    assert len(book.content.highlight_ids) == 1, "the selected text is already a saved highlight"

    # AND: Unsaved note of the first highlight is abandoned
    highlight = book.content.get_highlight(by_id=id_1)[0]
    assert not selenium.execute_script(HAS_INDICATOR, highlight), "note is saved for the highlight"


@markers.test_case("C602219")
@markers.desktop_only
@markers.parametrize("book_slug,page_slug", [("chemistry-atoms-first-2e", "preface")])
def test_modal_for_unsaved_notes_appears_on_clicking_search_result_same_page(
    selenium, base_url, book_slug, page_slug
):
    """Discard modal appears when unsaved notes are present & selecting search sidebar result in same page."""
    # GIVEN: Login book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    toolbar = book.toolbar
    search_sidebar = book.search_sidebar

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()

    # AND: Search results are displayed in sidebar
    search_term = utility.get_search_term(book_slug)
    toolbar.search_for(search_term)
    book.wait_for_page_to_load()
    search_results = search_sidebar.search_results(search_term)

    # AND: Highlight a paragraph, add a note & do not save
    paragraph = random.sample(book.content.paragraphs, 1)
    book.content.highlight(target=paragraph[0], offset=Highlight.ENTIRE, close_box=False)
    note = Utilities.random_string()
    book.content.highlight_box.note = note
    id_1 = book.content.highlight_ids[0]

    # WHEN: Click on a search result in the same page
    Utilities.click_option(selenium, element=search_results[1])

    # THEN: Discard modal is displayed
    assert book.discard_changes_modal_displayed
    assert book.discard_modal.content == "You have an unsaved note on this page."
    assert book.discard_modal.title == "Discard unsaved changes?"

    # WHEN: Click Cancel
    book.discard_modal.click_cancel_changes()

    # THEN: The modal is closed and the unsaved note is retained in the page
    assert book.content.highlight_box.is_open, "Highlight box not open"
    assert book.content.highlight_box.is_edit_box
    highlight = book.content.get_highlight(by_id=id_1)[0]
    assert "focus" in highlight.get_attribute("class"), "highlight is not in focus"
    assert book.content.highlight_box.note == note

    # WHEN: Click the same search result again
    Utilities.click_option(selenium, element=search_results[1])

    # AND: Click Discard changes in the modal
    book.discard_modal.click_discard_changes()
    book.wait_for_page_to_load()

    # THEN: Unsaved note of the user highlight is abandoned
    assert not selenium.execute_script(HAS_INDICATOR, highlight), "note is saved for the highlight"

    # AND: The selected search result is highlighted
    phrase_searched = book.content.find_elements(By.XPATH, XPATH_SEARCH.format(term=search_term))
    assert phrase_searched, f"the highlight phrase ('{search_term}') was not found on the page"

    assert "focus" in phrase_searched[1].get_attribute(
        "class"
    ), "search phrase does not have the search focus highlight"


@markers.test_case("C606118")
@markers.desktop_only
@markers.parametrize("book_slug,page_slug", [("microbiology", "preface")])
def test_modal_for_unsaved_notes_appears_on_clicking_search_result_different_page(
    selenium, base_url, book_slug, page_slug
):
    """Discard modal appears when unsaved notes are present & selecting search sidebar result in different page."""
    # GIVEN: Login book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    toolbar = book.toolbar
    search_sidebar = book.search_sidebar

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()

    # AND: Search results are displayed in sidebar
    search_term = utility.get_search_term(book_slug)
    toolbar.search_for(search_term)
    book.wait_for_page_to_load()
    search_results = search_sidebar.search_results(search_term)

    # AND: Highlight a paragraph, add a note & do not save
    paragraph = random.sample(book.content.paragraphs, 1)
    book.content.highlight(target=paragraph[0], offset=Highlight.ENTIRE, close_box=False)
    note = Utilities.random_string()
    book.content.highlight_box.note = note
    id_1 = book.content.highlight_ids[0]

    # WHEN: Click on a search result in different page
    Utilities.click_option(selenium, element=search_results[2])

    # THEN: Discard modal is displayed
    assert book.discard_changes_modal_displayed
    assert book.discard_modal.content == "You have an unsaved note on this page."
    assert book.discard_modal.title == "Discard unsaved changes?"

    # WHEN: Click Cancel
    book.discard_modal.click_cancel_changes()

    # THEN: The modal is closed and the unsaved note is retained in the page
    assert book.content.highlight_box.is_open, "Highlight box not open"
    assert book.content.highlight_box.is_edit_box
    highlight = book.content.get_highlight(by_id=id_1)[0]
    assert "focus" in highlight.get_attribute("class"), "highlight is not in focus"
    assert book.content.highlight_box.note == note

    # WHEN: Click the same search result again
    Utilities.click_option(selenium, element=search_results[2])

    # AND: Click Discard changes in the modal
    book.discard_modal.click_discard_changes()
    book.wait_for_page_to_load()

    # THEN: The selected search result is highlighted in the new page
    phrase_searched = book.content.find_elements(By.XPATH, XPATH_SEARCH.format(term=search_term))
    assert phrase_searched, f"the highlight phrase ('{search_term}') was not found on the page"

    assert "focus" in phrase_searched[0].get_attribute(
        "class"
    ), "search phrase does not have the search focus highlight"

    # AND: No highlight box is open in the new page
    with pytest.raises(NoSuchElementException) as e:
        book.content.highlight_box
    assert "No open highlight boxes found" in str(e.value), "highlight box is open in the new page"

    # AND: No existing highlights present in the new page
    try:
        assert not book.content.highlights
    except NoSuchElementException:
        pytest.fail("existing highlight present in the page")

    # WHEN: Navigate back to the initial page
    Utilities.click_option(selenium, element=search_results[0])
    book.wait_for_page_to_load()

    # THEN: The unsaved note in the initial page is not saved
    id_1 = book.content.highlight_ids[0]
    highlight = book.content.get_highlight(by_id=id_1)[0]
    assert not selenium.execute_script(HAS_INDICATOR, highlight), "note is saved for the highlight"
