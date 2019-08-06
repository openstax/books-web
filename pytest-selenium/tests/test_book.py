from tests import markers
from pages.content import Content
from pages.osweb import WebBase


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
    osweb.wait_for_load()

    # THEN: The page navigates to {base_url}/details/books/college-physics
    expected_page_url = base_url + "/details/books/" + book_slug

    assert expected_page_url == osweb.current_url
