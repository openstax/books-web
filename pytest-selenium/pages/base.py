from __future__ import annotations

from time import sleep
from typing import Tuple

import pypom
from selenium.webdriver.remote.webelement import WebElement
from selenium.common.exceptions import (
    ElementNotInteractableException,
    StaleElementReferenceException,
    TimeoutException,
    WebDriverException,
)
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as expected

from tests.conftest import DESKTOP, MOBILE


class Page(pypom.Page):
    def __init__(self, driver, base_url=None, timeout=30, **url_kwargs):
        super().__init__(driver, base_url, timeout, **url_kwargs)

    _math_equation_locator = (By.CSS_SELECTOR, "[id*=MathJax][id*=Frame] .math")
    _title_locator = (By.TAG_NAME, "title")
    _search_result_locator = (By.CSS_SELECTOR, "[class='search-highlight first text last focus']")

    @property
    def loaded(self) -> bool:
        return super().loaded and (sleep(1.0) or True)

    @property
    def page_title(self):
        return self.find_element(*self._title_locator).get_attribute("innerHTML")

    @property
    def window_width(self):
        return self.driver.get_window_size()["width"]

    @property
    def window_height(self):
        return self.driver.get_window_size()["height"]

    @property
    def is_mobile(self):
        # fuzzy match because scrollbars
        return abs(self.window_width - MOBILE[0]) < 10

    @property
    def is_desktop(self):
        # fuzzy match because scrollbars
        return abs(self.window_width - DESKTOP[0]) < 10

    @property
    def current_url(self):
        return self.driver.current_url

    def wait_for_region_to_display(self, region):
        self.wait.until(lambda _: region.is_displayed)
        return self

    def click_and_wait_for_load(self, element: WebElement):
        """Click an offscreen element and wait for title to load.

        Clicks the given element, even if it is offscreen, by sending the ENTER
        key. Returns after loading the last element (title) of the page).

        """
        title_before_click = self.page_title
        element.send_keys(Keys.ENTER)
        self.wait.until(lambda _: title_before_click != (self.page_title))

    def element_is_not_interactable(self, element):
        try:
            element.send_keys(Keys.ENTER)
        except ElementNotInteractableException:
            return True

        return False

    def width(self, element):
        return (
            self.driver.execute_script(
                "return window.getComputedStyle(arguments[0]).width;", element
            )
        ).strip("px")

    def height(self, element):
        return (
            self.driver.execute_script(
                "return window.getComputedStyle(arguments[0]).height;", element
            )
        ).strip("px")

    @property
    def scroll_position(self):
        return self.driver.execute_script("return window.pageYOffset;")

    @property
    def page_not_scrolled(self):
        return self.driver.execute_script("return window.pageYOffset;") == 0

    def offscreen_click(self, element=None):
        """Clicks an offscreen element (or the region's root).

        Clicks the given element, even if it is offscreen, by sending the ENTER
        key. Returns the element.

        .. note::
           We actually navigate using the ENTER key because scrolling the page
           can be flaky; see https://stackoverflow.com/a/39918249

        """
        # return self.page.offscreen_click(element or self.root)
        element.send_keys(Keys.ENTER)
        return element

    def reload(self, math_check: bool = False) -> Page:
        """Reload the current page.

        Ignore stale element issues because we're reloading the page;
        everything is going to be stale if accessed too quickly
        (multi-process Firefox issue).

        :param bool math_check: (optional) look for rendered math and, if not
            found, rerun MathJax's search
        :return: the current page
        :rtype:

        """
        try:
            self.driver.execute_script("location.reload();")
            self.wait_for_page_to_load()
        except StaleElementReferenceException:
            pass
        if math_check:
            wait = WebDriverWait(self.driver, 3)
            try:
                wait.until(lambda _: self.find_elements(*self._math_equation_locator))
            except TimeoutException:
                from warnings import warn

                warn(
                    "On page reload - "
                    "no math found or MathJax failed to load; "
                    "rerunning math search"
                )
                self.driver.execute_script("MathJax.Hub.Queue(['Typeset', MathJax.Hub]);")
                try:
                    wait.until(lambda _: self.find_elements(*self._math_equation_locator))
                except TimeoutException:
                    pass
                sleep(1.0)
        return self

    def get_window_size(self) -> Tuple[int, int]:
        """Return the width and height of the browser window.

        :return: the width and height of the current browser window
        :rtype: (int, int)

        """
        size = self.driver.get_window_size()
        return (size.get("width"), size.get("height"))

    def set_window_size(self, width: int = DESKTOP[0], height: int = DESKTOP[1]):
        """Resize the browser window.

        :param int width: the desired browser width in pixels
        :param int height: the desired browser height in pixels
        :return: None

        """
        self.driver.set_window_size(width=width, height=height)

    def switch_to_window(self, n):
        """"Switch to new browser tab.

        Wait till the number of tabs increases to minimum 2 before switching to the nth window.

        :param int n: the desired window handle to be switched to
        :return: None

        """

        WebDriverWait(self.driver, 5).until(expected.number_of_windows_to_be(2))

        try:
            self.driver.switch_to.window(self.driver.window_handles[n])

            if self.driver.current_window_handle != n:
                raise WebDriverException("Try again")

        except WebDriverException:
            self.driver.switch_to_window(self.driver.window_handles[n])

    @property
    def search_result(self):
        return self.find_element(*self._search_result_locator)

    def page_loaded_with_search_highlights(self):
        # WebDriverWait(self.driver, 5).until(expected.visibility_of(self.search_result))
        self.wait.until(expected.visibility_of_element_located(self._search_result_locator))
