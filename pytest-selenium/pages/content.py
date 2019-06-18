from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as expected


from pages.base import Page
from regions.base import Region


class Content(Page):
    URL_TEMPLATE = "/books/{book_slug}/pages/{page_slug}"
    _title_locator = (By.TAG_NAME, "title")
    _body_locator = (By.TAG_NAME, "body")
    _main_content_locator = (By.CSS_SELECTOR, "h1")
    _next_locator = (By.CSS_SELECTOR, "[aria-label='Next Page']")
    _previous_locator = (By.CSS_SELECTOR, "[aria-label='Previous Page']")

    @property
    def loaded(self):
        return self.find_element(*self._body_locator).get_attribute("data-rex-loaded")

    @property
    def next_link(self):
        return self.find_element(*self._next_locator)

    @property
    def previous_link(self):
        return self.find_element(*self._previous_locator)

    @property
    def navbar(self):
        return self.NavBar(self)

    @property
    def bookbanner(self):
        return self.BookBanner(self)

    @property
    def toolbar(self):
        return self.ToolBar(self)

    @property
    def sidebar(self):
        return self.SideBar(self)

    @property
    def attribution(self):
        return self.Attribution(self)

    @property
    def section_url_within_attribution(self):
        return self.find_element(*self._section_url_locator)

    def click_next_link(self):
        return self.offscreen_click(self.next_link)

    def click_previous_link(self):
        return self.offscreen_click(self.previous_link)

    class NavBar(Region):
        _root_locator = (By.CSS_SELECTOR, '[data-testid="navbar"]')
        _openstax_logo_link_locator = (By.CSS_SELECTOR, "div > a")

        @property
        def openstax_logo_link(self):
            return self.find_element(*self._openstax_logo_link_locator).get_attribute("href")

    class BookBanner(Region):
        _root_locator = (By.CSS_SELECTOR, '[data-testid="bookbanner"]')
        _book_title_locator = (By.CSS_SELECTOR, "div > a")

        @property
        def book_title(self):
            return self.find_element(*self._book_title_locator).text

    class ToolBar(Region):
        _root_locator = (By.CSS_SELECTOR, '[data-testid="toolbar"]')
        _toc_toggle_button_locator = (
            By.CSS_SELECTOR,
            "[aria-label='Click to open the Table of Contents']",
        )

        @property
        def toc_toggle_button(self):
            return self.find_element(*self._toc_toggle_button_locator)

        def click_toc_toggle_button(self):
            self.offscreen_click(self.toc_toggle_button)
            return self.page.sidebar.wait_for_region_to_display()

    class SideBar(Region):
        _root_locator = (By.CSS_SELECTOR, "[aria-label='Table of Contents']")

        @property
        def header(self):
            return self.Header(self.page)

        @property
        def toc(self):
            return self.TableOfContents(self.page)

        class Header(Region):
            _root_locator = (By.CSS_SELECTOR, '[data-testid="tocheader"]')
            _toc_toggle_button_locator = (
                By.CSS_SELECTOR,
                "[aria-label='Click to close the Table of Contents']",
            )

            @property
            def toc_toggle_button(self):
                return self.find_element(*self._toc_toggle_button_locator)

            def click_toc_toggle_button(self):
                self.offscreen_click(self.toc_toggle_button)
                return self.wait.until(
                    expected.invisibility_of_element_located(self.toc_toggle_button)
                )

        class TableOfContents(Region):
            _root_locator = (By.CSS_SELECTOR, "ol")
            _active_page_locator = (By.CSS_SELECTOR, "[aria-label='Current Page']")

            @property
            def active_title(self):
                return self.find_element(*self._active_page_locator).text

    class Attribution(Region):
        _root_locator = (By.CSS_SELECTOR, '[data-testid="attribution-details"]')
        _attribution_toggle_locator = (
            By.CSS_SELECTOR,
            '[data-testid="attribution-details"] summary',
        )
        _section_url_locator = (By.XPATH, "//*[contains(text(), 'Section URL')]/a")

        @property
        def attribution_link(self):
            return self.find_element(*self._attribution_toggle_locator)

        @property
        def is_open(self):
            return bool(self.root.get_attribute("open"))

        @property
        def section_url_within_attribution(self):
            return self.find_element(*self._section_url_locator)

        @property
        def section_url(self):
            return self.section_url_within_attribution.get_attribute("href")

        def click_attribution_link(self):
            self.offscreen_click(self.attribution_link)
            self.page.attribution.wait_for_region_to_display()
