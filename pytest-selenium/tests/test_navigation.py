import pytest
from pages.content import Content
from tests import markers


@markers.test_case("C477321")
@markers.parametrize("page_slug", [("preface")])
@markers.nondestructive
def test_previous_link_hidden_on_first_page(selenium, base_url, book_slug, page_slug):

    # GIVEN: The page is loaded
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    toolbar = content.toolbar
    toc = content.sidebar.toc

    # confirm first page is selected
    if toc.active_section.get_attribute("textContent") != toc.sections[0].section_title:
        while content.is_mobile:
            toolbar.click_toc_toggle_button()
            break
        toc.sections[0].click()

    # THEN: The "previous" link should be hidden
    with pytest.raises(Exception) as exc_info:
        assert not content.previous_link.is_displayed

    exception_raised = exc_info.type
    assert "NoSuchElementException" in str(exception_raised)

    # AND: The "next" link should not be hidden
    assert content.next_link.is_displayed


@markers.test_case("C477322")
@markers.parametrize("page_slug", [("index")])
@markers.nondestructive
def test_next_link_hidden_on_last_page(selenium, base_url, book_slug, page_slug):

    # GIVEN: The page is loaded
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    toolbar = content.toolbar
    toc = content.sidebar.toc

    # confirm last page is selected.
    if toc.active_section.get_attribute("textContent") != toc.sections[-1].section_title:
        while content.is_mobile:
            toolbar.click_toc_toggle_button()
            break
        toc.sections[-1].click()

    # THEN:The "next" link should be hidden
    with pytest.raises(Exception) as exc_info:
        assert not content.next_link.is_displayed

    exception_raised = exc_info.type
    assert "NoSuchElementException" in str(exception_raised)

    # AND: The "previous" link should be visible
    assert content.previous_link.is_displayed
