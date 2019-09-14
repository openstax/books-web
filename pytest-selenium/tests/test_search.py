from random import choice
from string import digits, ascii_letters
import pytest
from pages.content import Content
from tests import markers
from regions.search_sidebar import SearchSidebar
from regions import base

from time import sleep


@markers.test_case("C543235")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_message_when_search_yields_no_results(selenium, base_url, book_slug, page_slug):
    # GIVEN: book page is loaded
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    toolbar = content.toolbar
    mobile = content.mobile
    search_sidebar = content.sidebar.search_sidebar
    page_before_search = content.current_url

    # using regex to create a random search term
    search_term = "".join(choice(digits + ascii_letters) for i in range(25))

    # WHEN: search is triggered for a term which yields no results
    if content.is_mobile:
        toolbar.click_search_icon()
        mobile.search_textbox.send_keys(search_term)
        mobile.trigger_search()

    if content.is_desktop:
        toolbar.search_textbox.send_keys(search_term)
        toolbar.click_search()

    # THEN: search sidebar displays the message "Sorry, no results found for ‘<search_term>'"
    assert search_sidebar.has_no_results

    # AND: confirm the term displayed in the message matches the search_term keyed in
    assert search_term in search_sidebar.no_results_message

    # AND: user stays in the same page as before executing the search
    assert content.current_url == page_before_search
