from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

from pages import content
from pages.base import Page
from regions.base import Region
from utils.utility import WaitForTitleChange


class TableOfContents(Region):
    _root_locator = (By.CSS_SELECTOR, "ol")
    _section_link_locator = (By.CSS_SELECTOR, "ol li a")
    _active_section_locator = (By.CSS_SELECTOR, "[aria-label='Current Page']")

    @property
    def active_section(self):
        return self.find_element(*self._active_section_locator)

    @property
    def font_property_of_selected_section(self):
        bold = self.active_section.value_of_css_property("font-weight")
        return bold

    @property
    def sections(self):
        return [
            self.ContentPage(self, section_link)
            for section_link in self.find_elements(*self._section_link_locator)
        ]

    class ContentPage(Region, WaitForTitleChange):
        def click(self):
            self.click_and_wait_for_load(self.root)

        @property
        def section_title(self):
            return self.root.get_attribute("textContent")
