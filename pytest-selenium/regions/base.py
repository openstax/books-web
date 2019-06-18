import pypom

from selenium.webdriver.common.keys import Keys


class Region(pypom.Region):
    @property
    def is_displayed(self):
        return self.root.is_displayed()

    def wait_for_region_to_display(self):
        self.page.wait_for_region_to_display(self)
        return self

    def offscreen_click(self, element=None):
        """Clicks an offscreen element (or the region's root).

        Clicks the given element, even if it is offscreen, by sending the ENTER key.
        Returns the element.
        """
        # We actually navigate using the ENTER key because scrolling the page can be flaky
        # https://stackoverflow.com/a/39918249
        return self.page.offscreen_click(element or self.root)
