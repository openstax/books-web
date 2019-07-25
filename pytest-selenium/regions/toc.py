from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

from pages import content
from pages.base import Page
from regions.base import Region

from utils.utilities import WaitForTitleChange


class TableOfContents(Region):
    _root_locator = (By.CSS_SELECTOR, "ol")
    _section_link_locator = (By.CSS_SELECTOR, "ol li a")
    _active_section_locator = (By.CSS_SELECTOR, "[aria-label='Current Page']")
    _default_page_locator = (By.CSS_SELECTOR, "li:nth-of-type(2) a")

    @property
    def active_section(self):
        return self.find_element(*self._active_section_locator)

    @property
    def sections(self):
        return [
            self.ContentPage(self, section_link)
            for section_link in self.find_elements(*self._section_link_locator)
        ]

    @property
    def default_page_url(self):
        return self.find_element(*self._default_page_locator).get_attribute("href")

    class ContentPage(Region, WaitForTitleChange):
        def click(self):
            self.click_and_wait_for_load(self.root)

        @property
        def section_title(self):
            section_title = self.root.get_attribute("textContent")
            return section_title
