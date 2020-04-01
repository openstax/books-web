"""Utility functions and class helpers for rex-web automation."""

from __future__ import annotations

from enum import Enum
from platform import system
from random import choice, choices, randint
from string import digits, ascii_letters

from time import sleep
from typing import Dict, List, Tuple

from faker import Faker
from selenium.common.exceptions import (
    ElementClickInterceptedException,
    NoSuchElementException,
    StaleElementReferenceException,
    WebDriverException,
)
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.remote.webelement import WebElement

# Constant usage values for javascript commands
ASYNC_DELETE = r"""
(async function delete_page_highlights() {
  const ids = __APP_STORE.getState().content.highlights.highlights.map(({id}) => id);
  for(id of ids) await __APP_SERVICES.highlightClient.deleteHighlight({id});
})()"""  # NOQA
HAS_SCROLL_BAR = r"""
const hasScrollBar = (element) => {
  const {scrollTop} = element;
  if(scrollTop > 0) { return true; }
  element.scrollTop += 10;
  if(scrollTop === element.scrollTop) { return false; }
  element.scrollTop = scrollTop; return true; };
return hasScrollBar(arguments[0]);"""
HIGHLIGHTS = "return document.querySelectorAll('.highlight').length;"
PAGE_HIGHLIGHTS = "return __APP_STORE.getState().content.highlights.highlights;"  # NOQA
RELOAD = "location.reload();"
SCROLL_INTO_VIEW = "arguments[0].scrollIntoView();"
SHIFT_VIEW_BY = "window.scrollBy(0, arguments[0]);"


class Color(Enum):
    """Highlight color options."""

    BLUE = "blue"
    GREEN = "green"
    PINK = "pink"
    PURPLE = "purple"
    YELLOW = "yellow"

    def __str__(self):
        return self.value

    @classmethod
    def from_html_class(cls, classes: str) -> Color:
        """Get the Color enum from the HTML class string.

        :param str classes: the HTML element class attribute string
        :return: the enum identity for the color found in the string
        :rtype: Color
        :raises ValueError: if a color is not found in the HTML attribute

        """
        class_list = set(classes.split())
        color_list = set([color.value for color in cls.options()])
        return cls.from_color_string(list(class_list & color_list)[0])

    @classmethod
    def from_color_string(cls, color: str) -> Color:
        """Get the Color enum from the color value string.

        :param str color: the Color value
        :return: the enum identity for that color string
        :rtype: Color
        :raises ValueError: if the color is not a valid Color

        """
        for option in cls.options():
            if option.value == color:
                return option
        raise ValueError(f"{color} not an available Color")

    @classmethod
    def options(cls) -> List[Color]:
        return [color for _, color in cls.__members__.items()]


class FontProperties:
    def is_bold(self, element):
        return element.value_of_css_property("font-weight") == "400"


class Highlight:
    """Supplimental resources for book highlighting."""

    Offset = Tuple[int, int]

    COLORS = Color.options()
    RANDOM = "randomize"
    ENTIRE = "all"

    @classmethod
    def delete_highlights_on_page(cls, driver):
        """Purge the highlights for the current user on the current book page.

        Trigger a javascript command to clean up the current page and remove
        all highlights. Reload the page to see the updated UI.

        :param driver: the selenium webdriver object
        :returns: None

        """
        total_page_highlights = driver.execute_script(HIGHLIGHTS)
        driver.execute_script(ASYNC_DELETE)
        sleep(total_page_highlights * 0.05)
        driver.execute_script(RELOAD)

    @classmethod
    def get_position(cls, driver, element: WebElement) -> Dict[str, float]:
        """Return the position details for a specific page highlight or box.

        :param driver: a webdriver instance
        :param WebElement element: the requested element or object root
        :return: the ``top``, ``right`` side, ``bottom``, and ``left`` side
            pixel positions within the current web page
        :rtype: dict(str, float)

        """
        position = driver.execute_script("return arguments[0].getBoundingClientRect();", element)
        return {
            "top": position.get("top"),
            "right": position.get("right"),
            "bottom": position.get("bottom"),
            "left": position.get("left"),
        }

    @classmethod
    def random_color(cls) -> int:
        """Return a random color.

        :return: a random highlight color
        :rtype: int

        """
        return choice(cls.COLORS)

    @classmethod
    def page_highlights(cls, driver) -> int:
        """Return the number of page highlights found in the database.

        :param driver: a webdriver instance
        :return: the number of highlights on the page as indicated by the
            database (may be different from the number of visual highlights if
            one or more highlight elements are not written to the HTML)
        :rtype: int

        """
        return len(driver.execute_script(PAGE_HIGHLIGHTS))


class Library(object):

    books = {
        "anatomy-and-physiology": {"default_page": "1-introduction", "search_term": "heart"},
        "astronomy": {"default_page": "1-introduction", "search_term": "leap year"},
        "biology-2e": {"default_page": "1-introduction", "search_term": "bacteria"},
        "biology-ap-courses": {"default_page": "1-introduction", "search_term": "Virus"},
        "chemistry-2e": {"default_page": "1-introduction", "search_term": "molecule"},
        "chemistry-atoms-first-2e": {
            "default_page": "1-introduction",
            "search_term": "Thermal Equilibrium",
        },
        "college-physics": {
            "default_page": "1-introduction-to-science-and-the-realm-of-"
            "physics-physical-quantities-and-units",
            "search_term": "Newton's first law",
        },
        "college-physics-ap-courses": {
            "default_page": "1-connection-for-ap-r-courses",
            "search_term": "kinetic energy",
        },
        "concepts-biology": {"default_page": "1-introduction", "search_term": "Cell"},
        "microbiology": {"default_page": "1-introduction", "search_term": "fungus"},
        "calculus-volume-1": {
            "default_page": "1-introduction",
            "search_term": "summation notation",
        },
        "calculus-volume-2": {
            "default_page": "1-introduction",
            "search_term": "summation notation",
        },
        "calculus-volume-3": {"default_page": "1-introduction", "search_term": "zero vector"},
        "university-physics-volume-1": {
            "default_page": "1-introduction",
            "search_term": "interference",
        },
        "university-physics-volume-2": {
            "default_page": "1-introduction",
            "search_term": "interference fringes",
        },
        "university-physics-volume-3": {
            "default_page": "1-introduction",
            "search_term": "interference fringes",
        },
        "american-government-2e": {"default_page": "1-introduction", "search_term": "mass media"},
        "principles-economics-2e": {"default_page": "1-introduction", "search_term": "Elasticity"},
        "principles-macroeconomics-2e": {
            "default_page": "1-introduction",
            "search_term": "modern economic growth",
        },
        "principles-microeconomics-2e": {
            "default_page": "1-introduction",
            "search_term": "Explicit costs",
        },
        "introduction-sociology-2e": {
            "default_page": "1-introduction-to-sociology",
            "search_term": "certificates or degrees",
        },
        "us-history": {"default_page": "1-introduction", "search_term": "PATRIOTS"},
        "principles-financial-accounting": {
            "default_page": "1-why-it-matters",
            "search_term": "Explain the Pricing of Long-Term Liabilities",
        },
        "principles-managerial-accounting": {
            "default_page": "1-why-it-matters",
            "search_term": "relevant range",
        },
        "introduction-business": {
            "default_page": "1-introduction",
            "search_term": "Buyer behavior",
        },
        "business-ethics": {"default_page": "1-introduction", "search_term": "enculturation"},
        "introductory-business-statistics": {
            "default_page": "1-introduction",
            "search_term": "chi-square distribution",
        },
        "principles-management": {
            "default_page": "1-introduction",
            "search_term": "plan is a decision to carry out a particular action",
        },
        "entrepreneurship": {"default_page": "1-introduction", "search_term": "Business Model"},
        "organizational-behavior": {
            "default_page": "1-introduction",
            "search_term": "organizational development",
        },
        "introductory-statistics": {
            "default_page": "1-introduction",
            "search_term": "randomly selected student",
        },
        "precalculus": {
            "default_page": "1-introduction-to-functions",
            "search_term": "Pythagorean Identities",
        },
        "college-algebra": {
            "default_page": "1-introduction-to-prerequisites",
            "search_term": "hyperbola",
        },
        "algebra-and-trigonometry": {
            "default_page": "1-introduction-to-prerequisites",
            "search_term": "Graphs of Parabolas",
        },
        "business-law-i-essentials": {
            "default_page": "1-introduction",
            "search_term": "industrialization",
        },
        "principles-macroeconomics-ap-courses-2e": {
            "default_page": "1-introduction",
            "search_term": "adjustable-rate mortgage",
        },
        "principles-microeconomics-ap-courses-2e": {
            "default_page": "1-introduction",
            "search_term": "positive externality",
        },
        "prealgebra-2e": {"default_page": "1-introduction", "search_term": "Whole Numbers"},
    }

    def random_book_slug(self):
        random_book_slug = choice(list(self.books.keys()))
        return random_book_slug


def get_default_page(element):
    book_list = Library.books
    default_page = book_list[element]["default_page"]
    return default_page


def get_search_term(element):
    book_list = Library.books
    search_term = book_list[element]["search_term"]
    return search_term


class Utilities(object):
    """Helper functions for various Pages actions."""

    @classmethod
    def clear_field(cls, driver, field):
        """Clear the contents of text-type fields.

        :param driver: a selenium webdriver
        :param field: an input field to interact with
        :type driver: Webdriver
        :type field: WebElement
        :returns: None
        """
        sleep(0.1)
        if driver.name == "firefox":
            special = Keys.COMMAND if system() == "Darwin" else Keys.CONTROL
            ActionChains(driver).click(field).key_down(special).send_keys("a").key_up(
                special
            ).send_keys(Keys.DELETE).perform()
            return
        clear = []
        for _ in range(len(field.get_attribute("value"))):
            clear.append(Keys.DELETE)
            clear.append(Keys.BACKSPACE)
        field.send_keys(clear)

    @classmethod
    def click_option(cls, driver, locator=None, element=None, scroll_to=False):
        """Click on elements which cause Safari 500 errors."""
        element = element if element else driver.find_element(*locator)
        if scroll_to or type(scroll_to) in (int, float):
            shift = int(scroll_to) if int(scroll_to) != 1 else 0
            Utilities.scroll_to(driver=driver, element=element, shift=shift)
        try:
            if driver.capabilities.get("browserName").lower() == "safari":
                raise WebDriverException("Bypassing the driver-defined click")
            element.click()
        except WebDriverException:
            for _ in range(10):
                try:
                    driver.execute_script("arguments[0].click()", element)
                    break
                except ElementClickInterceptedException:  # Firefox issues
                    sleep(1.0)
                except NoSuchElementException:  # Safari issues
                    if locator:
                        element = driver.find_element(*locator)
                except StaleElementReferenceException:  # Chrome and Firefox
                    if locator:
                        element = driver.find_element(*locator)

    @classmethod
    def has_scroll_bar(cls, driver, element) -> bool:
        """Return True if the element currently has a vertical scroll bar.

        :param driver: a selenium webdriver
        :param element: the page element
        :type driver: Webdriver
        :type element: WebElement
        :return: ``True`` if the element has a vertical scroll bar
        :rtype: bool

        """
        return driver.execute_script(HAS_SCROLL_BAR, element)

    @classmethod
    def random_name(cls) -> Tuple(str, str):
        """Generate a random name for an Accounts user.

        :return: the first and last name
        :rtype: tuple(str, str)

        """
        fake = Faker()
        use_male_functions = randint(0, 1) == 0
        return (
            fake.first_name_male() if use_male_functions else fake.first_name_female(),
            fake.last_name(),
        )

    @classmethod
    def random_string(cls, length: int = 100) -> str:
        """Return a random string of a specified length for use in notes.

        :param int length: (optional) the length of the desired string
        :return: a string of random letters and digits with inner white space
        :rtype: str

        """
        characters = ascii_letters + digits + " " * 6 + "\n" * 2
        string = "".join(choices(population=characters, k=length)).strip()
        mod_len = length - len(string)
        mod = "".join(choices(population=characters.strip(), k=mod_len))
        return f"{string}{mod}"

    @classmethod
    def scroll_to(cls, driver, element_locator=None, element=None, shift=0):
        """Scroll the screen to the element.

        :param driver: the selenium webdriver browser object
        :param element_locator: a By selector and locator tuple (str, str)
        :param element: a specific webelement
        :param shift: adjust the page vertically by a set number of pixels
                > 0 scrolls down, < 0 scrolls up
        :returns: None
        """
        target = element if element else driver.find_element(*element_locator)
        driver.execute_script(SCROLL_INTO_VIEW, target)
        if shift != 0:
            driver.execute_script(SHIFT_VIEW_BY, shift)

    @classmethod
    def scroll_top(cls, driver):
        """Scroll to the top of the browser screen.

        :param driver: the selenium webdriver object
        :returns: None

        """
        driver.execute_script("window.scrollTo(0, 0);")
        sleep(0.75)
