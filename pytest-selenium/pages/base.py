from tests.conftest import DESKTOP, MOBILE

import pypom
from selenium.webdriver.common.keys import Keys


class Page(pypom.Page):
    def __init__(self, driver, base_url=None, timeout=30, **url_kwargs):
        super().__init__(driver, base_url, timeout, **url_kwargs)

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

    @property
    def loaded(self):
        return self.page.book_title == self.content.sidebar.active_title

    def offscreen_click(self, element):
        """Clicks an offscreen element.

        Clicks the given element, even if it is offscreen, by sending the ENTER key.
        Returns the element.
        """
        # We actually navigate using the ENTER key because scrolling the page can be flaky
        # https://stackoverflow.com/a/39918249
        element.send_keys(Keys.ENTER)
        return self.loaded
