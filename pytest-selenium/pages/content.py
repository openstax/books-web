from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as expected
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.touch_actions import TouchActions

import random

from pages.base import Page
from regions.base import Region
from regions.toc import TableOfContents


class Content(Page):
    URL_TEMPLATE = "/books/{book_slug}/pages/{page_slug}"
    _body_locator = (By.TAG_NAME, "body")
    _main_content_locator = (By.CSS_SELECTOR, "h1")
    _next_locator = (By.CSS_SELECTOR, "[aria-label='Next Page']")
    _previous_locator = (By.CSS_SELECTOR, "[aria-label='Previous Page']")
    _print_locator = (By.CSS_SELECTOR, '[data-testid="print"]')

    @property
    def loaded(self):
        return self.find_element(*self._body_locator).get_attribute("data-rex-loaded")

    @property
    def print(self):
        return self.find_element(*self._print_locator)

    @property
    def previous_link(self):
        return self.find_element(*self._previous_locator)

    @property
    def next_link(self):
        return self.find_element(*self._next_locator)

    @property
    def previous_link_is_displayed(self):
        try:
            return self.previous_link.is_displayed()
        except NoSuchElementException:
            return False

    @property
    def next_link_is_displayed(self):
        try:
            return self.next_link.is_displayed()
        except NoSuchElementException:
            return False

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
    def sidebar_width_offset(self):
        sidebar_width = self.width(self.sidebar.root)
        sidebar_width_left_offset = self.sidebar.root.get_attribute("offsetLeft")
        sidebar_width_offset = int(sidebar_width) + int(sidebar_width_left_offset)
        return sidebar_width_offset

    @property
    def sidebar_height_offset(self):
        navbar_height = self.height(self.navbar.root)
        bookbanner_height = self.height(self.bookbanner.root)
        sidebar_height_offset = int(navbar_height) + int(bookbanner_height)
        return sidebar_height_offset

    @property
    def window_height(self):
        window_height = int(self.height(self.sidebar.root)) + self.sidebar_height_offset
        return window_height

    def scroll_over_content_overlay(self):
        """Touch and scroll starting at on_element, moving by xoffset and yoffset.

        x & y are random numbers computed from the sidebar/window width/height respectively.
        Using touchactions to scroll from the print element.
        Selenium is not throwing any exception while scrolling over the content overlay using scroll(x,y).
        Hence using scroll_from_element(element, x, y) to capture & assert the exception.
        """
        x = random.randint(self.sidebar_width_offset, self.window_width)
        y = random.randint(self.sidebar_height_offset, self.window_height)

        touchActions = TouchActions(self.driver)
        touchActions.scroll_from_element(self.print, x, y).perform()

    def click_content_overlay(self):
        """Click anywhere in the content overlay

        x & y are random numbers computed from the sidebar/window width/height respectively.
        Using actionchains to click on this position.
        """
        x = random.randint(self.sidebar_width_offset, self.window_width)
        y = random.randint(self.sidebar_height_offset, self.window_height)

        actionChains = ActionChains(self.driver)
        actionChains.move_to_element_with_offset(self.driver.find_element_by_tag_name("body"), 0, 0)
        actionChains.move_by_offset(x, y).click().perform()
        return self.wait.until(
            expected.invisibility_of_element_located(self.sidebar.header.toc_toggle_button)
        )

    def click_next_link(self):
        self.click_and_wait_for_load(self.next_link)

    def click_previous_link(self):
        self.click_and_wait_for_load(self.previous_link)

    class NavBar(Region):
        _root_locator = (By.CSS_SELECTOR, '[data-testid="navbar"]')
        _openstax_logo_link_locator = (By.CSS_SELECTOR, "div > a")

        @property
        def openstax_logo_link(self):
            return self.find_element(*self._openstax_logo_link_locator).get_attribute("href")

    class BookBanner(Region):
        _root_locator = (By.CSS_SELECTOR, '[data-testid="bookbanner"]')
        _book_title_locator = (By.CSS_SELECTOR, "div > a")
        _chapter_title_locator = (By.CSS_SELECTOR, "div > h1 > span.os-text")
        _chapter_section_locator = (By.CSS_SELECTOR, "div > h1 > span.os-number")

        @property
        def book_title(self):
            return self.find_element(*self._book_title_locator)

        @property
        def chapter_title(self):
            return self.find_element(*self._chapter_title_locator).text

        @property
        def chapter_section(self):
            # The section isn't always included on the page so we return None
            try:
                element = self.find_element(*self._chapter_section_locator)
                return element.text
            except NoSuchElementException:
                return None

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
            return TableOfContents(self.page)

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
