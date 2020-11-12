# flake8: noqa
import pytest
from selenium.common.exceptions import NoSuchElementException, TimeoutException

from tests import markers
from pages.content import Content
from pages.osweb import WebBase
from utils.utility import Utilities


@markers.test_case("C476808")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_book_title_links_to_books_detail_page(selenium, base_url, book_slug, page_slug):

    # GIVEN: A page is loaded
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    # WHEN: The book title in the book banner is clicked
    book_banner = content.bookbanner
    book_banner.book_title.click()

    osweb = WebBase(selenium)
    osweb.wait_for_page_to_load()

    # THEN: The page navigates to {base_url}/details/books/college-physics
    expected_page_url = base_url + "/details/books/" + book_slug

    assert expected_page_url == osweb.current_url


@markers.test_case("C583482")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_order_print_copy(selenium, base_url, book_slug, page_slug):

    # GIVEN: Open osweb book details page
    osweb = WebBase(selenium, base_url, book_slug=book_slug).open()
    osweb.wait_for_load()

    # AND: verify if 'order on amazon' option is present in the osweb print options modal
    book_availability_in_amazon = osweb.book_status_on_amazon()

    # WHEN: Click the view online link in osweb book detail page
    osweb.click_view_online()

    # THEN: Order print copy option is present in rex page
    rex = Content(selenium)
    if book_availability_in_amazon is not None:
        Utilities.click_option(selenium, element=rex.order_print_copy)
        # AND: The Amazon link should be opened in a new tab
        rex.switch_to_window(1)
        assert (
            rex.current_url == book_availability_in_amazon
        ), "rex book has different amazon link than osweb"

        # AND: Order print copy button is present in all pages
        rex.switch_to_window(0)
        rex.click_next_link()
        assert rex.order_print_copy.is_displayed()

    # AND: Order print copy option should not be present in Rex if osweb has no amazon link
    else:
        with pytest.raises(NoSuchElementException):
            assert (
                not rex.order_print_copy
            ), "amazon print option present in rex but not present in osweb"


@markers.test_case("C613211")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_redirect_to_osweb_404_when_book_is_incorrect(selenium, base_url, book_slug, page_slug):
    """User is redirected to osweb 404 page when book slug doesn't exist"""

    # WHEN: A page is loaded with incorrect book slug
    try:
        Content(selenium, base_url, book_slug=f"{book_slug}{'test'}", page_slug=page_slug).open()
    except TimeoutException:
        pass

    # THEN: osweb 404 page is displayed
    osweb = WebBase(selenium)
    assert osweb.osweb_404_displayed
    assert (
        osweb.osweb_404_error
        == "Uh-oh, no page hereKudos on your desire to explore! Unfortunately, we don't have a page to go with that particular location."
    )


@markers.test_case("C614212")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_redirect_to_osweb_404_when_page_is_incorrect_in_first_session(
    selenium, base_url, book_slug, page_slug
):
    """Rex 404 page is displayed when user opens incorrect page in the first session"""

    # WHEN: A page is loaded with incorrect page slug in the first session
    try:
        Content(selenium, base_url, book_slug=book_slug, page_slug=f"{page_slug}{'test'}").open()
    except TimeoutException:
        pass

    # THEN: osweb 404 page is displayed
    osweb = WebBase(selenium)
    assert osweb.osweb_404_displayed
    assert (
        osweb.osweb_404_error
        == "Uh-oh, no page hereKudos on your desire to explore! Unfortunately, we don't have a page to go with that particular location."
    )
