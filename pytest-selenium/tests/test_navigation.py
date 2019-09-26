import pytest
from pages.content import Content
from tests import markers


@markers.test_case("C477321")
@markers.parametrize("page_slug", [("index")])
@markers.nondestructive
def test_previous_link_hidden_on_first_page(selenium, base_url, book_slug, page_slug):

    # GIVEN: The page is loaded
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    toolbar = content.toolbar
    toc = content.sidebar.toc

    # confirm first page is selected
    if not toc.first_section.is_active:
        if content.is_mobile:
            toolbar.click_toc_toggle_button()
        toc.first_section.click()

    # THEN: The "previous" link should be hidden
    assert not content.previous_link_is_displayed

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

    # confirm last page is selected
    if not toc.last_section.is_active:
        if content.is_mobile:
            toolbar.click_toc_toggle_button()
        toc.last_section.click()

    # THEN: The "next" link should be hidden
    assert not content.next_link_is_displayed

    # AND: The "previous" link should not be hidden
    assert content.previous_link.is_displayed
