import pytest
from pages.content import Content
from . import markers


@markers.test_case("C250849", "C242270")
@markers.parametrize("book_slug,page_slug", [("college-physics", "preface")])
@markers.nondestructive
def test_toc_toggle_button_opens_and_closes(selenium, base_url, book_slug, page_slug):
    """ Test that table of contents toggle button opens and closes the sidebar

    The table of contents sidebar is open by default for desktop resolutions
    and closed for mobile and tablet. We need to do different actions based
    on the resolution. When the resolution is desktop we
    click the toc button on the sidebar to close and the toc button on the
    toolbar to open. It's the other way around for mobile and tablet because
    the sidebar is closed by default.

    """
    # GIVEN: The selenium driver, base_url, book_slug, and page_slug

    # WHEN: The book and page URL is loaded
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    toolbar = content.toolbar
    sidebar = content.sidebar
    toc = content.sidebar.toc

    # AND: Window width is 1024 or greater (Desktop)
    if content.is_desktop:

        # THEN: Sidebar is open by default
        assert sidebar.header.is_displayed

        # AND: The page name in the sidebar is bolded to indicate that its selected
        toc.assert_page_name_in_TOC_is_bolded()

        # WHEN: The toc button on the sidebar is clicked
        # THEN: The sidebar area has been closed
        # AND: The toc button on the toolbar is clicked
        # AND: The side bar is opened again
        sidebar.header.click_toc_toggle_button()

        assert not sidebar.header.is_displayed

        toolbar.click_toc_toggle_button()

        assert sidebar.header.is_displayed

    # AND: Window Size is Mobile
    elif content.is_mobile:

        # THEN: Sidebar is closed by default
        assert not sidebar.header.is_displayed

        # WHEN: The toc button on the toolbar is clicked
        # THEN: The sidebar area is opened
        # AND: The toc button on the sidebar is clicked
        # AND: the sidebar area is closed
        toolbar.click_toc_toggle_button()

        assert sidebar.header.is_displayed

        # AND: The page name in the sidebar is bolded to indicate that its selected
        toc.assert_page_name_in_TOC_is_bolded()

        sidebar.header.click_toc_toggle_button()

        assert not sidebar.header.is_displayed

    else:

        pytest.fail("window must be either mobile or desktop size")


@markers.test_case("C476819")
@markers.parametrize(
    "book_slug,page_slug",
    [
        (
            "college-physics",
            "1-introduction-to-science-and-the-realm-of-physics-physical-quantities-and-units",
        )
    ],
)
@markers.nondestructive
def test_toc_closes_after_selecting_page_in_mobile(selenium, base_url, book_slug, page_slug):
    # GIVEN: The selenium driver, base_url, book_slug, and page_slug is opened in mobile resolution
    # AND: The TOC is opened

    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    toolbar = content.toolbar
    sidebar = content.sidebar
    toc = content.sidebar.toc

    toolbar.click_toc_toggle_button()

    # WHEN: The page in the ToC is clicked
    pages = toc.pages[5]
    pages.click()

    # THEN: The page loads and the ToC is automatically closed
    assert not sidebar.is_displayed
