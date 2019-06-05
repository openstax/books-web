from pages.content import Content
from tests import markers
from selenium.webdriver.support import expected_conditions as expected


@markers.test_case("C476302")
@markers.parametrize("book_slug,page_slug", [("college-physics", "preface")])
@markers.nondestructive
def test_section_url_in_citation_text_shows_url_for_current_page(
    selenium, base_url, book_slug, page_slug
):
    """
    citation text shows url for current page.

    GIVEN: A page URL in the format of {base_url}/books/{book_slug}/pages/{page_slug}
    WHEN: The page is fully loaded
    AND: The attribution section is expanded when clicked
    THEN: The section url in the the attribution should reference current page in rex
    """
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    attribution = content.attribution
    attribution.click_attribution_link()
    attribution_section_url_expected = (
        "https://openstax.org/books/" + book_slug + "/pages/" + page_slug
    )

    # Validate section url within attribution refers to current page
    assert attribution_section_url_expected == attribution.section_url


@markers.test_case("C476303")
@markers.parametrize("book_slug,page_slug", [("college-physics", "preface")])
@markers.nondestructive
def test_attribution_collapsed_by_default_expands_when_clicked(
    selenium, base_url, book_slug, page_slug
):

    # GIVEN: A page URL in the format of {base_url}/books/{book_slug}/pages/{page_slug}
    # WHEN: The page is fully loaded
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    attribution = content.attribution

    # THEN: The attribution section is collapsed by default
    assert not attribution.is_open

    # AND: The attribution section opens when clicked
    attribution.click_attribution_link()
    assert attribution.is_open

    # AND: The attribution collapses on clicking it again
    attribution.click_attribution_link()
    assert not attribution.is_open


@markers.test_case("C476304")
@markers.parametrize(
    "book_slug,page_slug", [("college-physics", "1-2-physical-quantities-and-units")]
)
@markers.nondestructive
def test_attribution_collapses_on_navigating_to_new_page(selenium, base_url, book_slug, page_slug):

    # GIVEN: A page URL in the format of {base_url}/books/{book_slug}/pages/{page_slug}
    # AND: The citation/attribution tab is open
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    attribution = content.attribution
    attribution.click_attribution_link()

    # WHEN: Navigating via next link
    content.click_next_link()

    # THEN: The citation/attribution section is not open on the new page
    assert not attribution.is_open

    attribution.click_attribution_link()

    # WHEN: Navigating via Back link
    content.click_previous_link()

    # THEN: The citation/attribution section is not open on the new page
    assert not attribution.is_open

    attribution.click_attribution_link()
    from time import sleep

    # WHEN: Navigating via TOC link
    toolbar = content.toolbar
    sidebar = content.sidebar

    if content.is_desktop:
        sidebar.header.click_toc_element()
        sleep(2)
        # THEN: the citation/attribution section is not open on the new page
        print(attribution.is_open)  # none
        assert not attribution.is_open

    if content.is_mobile:
        toolbar.click_toc_toggle_button()
        sleep(1)
        sidebar.header.click_toc_element()
        sleep(2)
        print(attribution.is_open)  # none
        assert not attribution.is_open


@markers.test_case("C476304")
@markers.parametrize("book_slug,page_slug", [("college-physics", "preface")])
@markers.nondestructive
def test_toc_local(selenium, base_url, book_slug, page_slug):

    # GIVEN: A page URL in the format of {base_url}/books/{book_slug}/pages/{page_slug}
    # AND: The citation/attribution tab is open
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    toc = content.sidebar.toc
    from time import sleep

    sleep(1)

    print(toc.chapter_expanded)

    print(toc.chapter_link)
    print(toc.toc_chapter[2].text)
    print(toc.number_of_chapters)
    chapter = toc.chapters[0]
    chapter = chapter.click()
    sleep(3)
