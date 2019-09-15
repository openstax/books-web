from pages.base import Page
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as expected
from selenium.webdriver.common.action_chains import ActionChains


class WebBase(Page):
    _root_locator = (By.CSS_SELECTOR, "body.page-loaded")
    _user_nav_locator = (By.CSS_SELECTOR, '[class*="login-dropdown"]')
    _logout_locator = (By.CSS_SELECTOR, "[href*=logout]")

    @property
    def loaded(self):
        """Return True when the page-loaded class is added to the body tag."""
        return (self.find_element(*self._root_locator)).is_displayed()

    @property
    def user_nav(self):
        return self.find_element(*self._user_nav_locator)

    # @property
    # def user_is_logged_in(self):
    #     if self.user_nav.is_present():
    #         if self.expected.invisibility_of_element_located(self.toc_toggle_button):
    #             return True

    @property
    def logout(self):
        return self.find_element(*self._logout_locator)

    def click_logout(self):
        actionChains = ActionChains(self.driver)
        actionChains.move_to_element(self.user_nav).click(self.logout).perform()

    def wait_for_load(self):
        return self.wait.until(lambda _: self.loaded)
