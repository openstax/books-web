from pages.base import Page
from selenium.webdriver.common.by import By


class WebBase(Page):
    _root_locator = (By.CSS_SELECTOR, "body.page-loaded")

    @property
    def loaded(self):
        """Return True when the page-loaded class is added to the body tag."""
        return (self.find_element(*self._root_locator)).is_displayed()

    def wait_for_load(self):
        return self.wait.until(lambda _: self.loaded)
