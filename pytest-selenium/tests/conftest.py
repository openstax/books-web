import sys

import os

import pytest

from utils import utility


# Window resolutions. Pytest takes these inputs backwards.
DESKTOP = (1500, 1080)
# this used to be 414x738, but it looks like chrome won't resize lower than 500
MOBILE = (500, 738)


@pytest.fixture(
    scope="function",
    params=[DESKTOP, MOBILE],
    ids=[f"{DESKTOP[1]}x{DESKTOP[0]}", f"{MOBILE[1]}x{MOBILE[0]}"],
)
def selenium(selenium, request):
    """Fixture to set custom selenium parameters.

    This fixture will also parametrize all of the tests to run them on both a
    Desktop resolution and a mobile resolution.

    This fixture also helps skip desktop for tests focussing only on mobile.

    Desktop size: 1920x1080
    Mobile size: 738x414 (iPhone 7+)
    """
    marker = request.node.get_closest_marker("mobile_only")
    if marker and request.param == DESKTOP:
        pytest.skip("Skipping desktop test")
    selenium.set_window_size(*request.param)
    return selenium


def pytest_addoption(parser):
    """Adds additional options to the pytest command line

    """
    group = parser.getgroup("selenium", "selenium")
    group.addoption(
        "--disable-dev-shm-usage",
        action="store_true",
        default=os.getenv("DISABLE_DEV_SHM_USAGE", False),
        help="disable chrome's usage of /dev/shm.",
    )
    group.addoption(
        "--headless",
        action="store_true",
        default=os.getenv("HEADLESS", False),
        help="enable headless mode for chrome.",
    )
    group.addoption(
        "--no-sandbox",
        action="store_true",
        default=os.getenv("NO_SANDBOX", False),
        help="disable chrome's sandbox.",
    )


@pytest.fixture
def language(request):
    return "en"


@pytest.fixture
def chrome_options(chrome_options, pytestconfig, language):
    """Fixture to set custom chrome options

    This fixture is also important to add options to the command line that
    support running the Chrome WebDriver in Travis or other languages

    """
    if pytestconfig.getoption("--headless"):
        chrome_options.headless = True

    # Required to run in Travis containers
    if pytestconfig.getoption("--no-sandbox"):
        chrome_options.add_argument("--no-sandbox")
    if pytestconfig.getoption("--disable-dev-shm-usage"):
        chrome_options.add_argument("--disable-dev-shm-usage")

    # Set the browser language
    chrome_options.add_argument("--lang={lang}".format(lang=language))
    chrome_options.add_experimental_option("prefs", {"intl.accept_languages": language})

    return chrome_options


def pytest_runtest_setup(item):
    for marker in item.iter_markers(name="my_marker"):
        print(marker)
        sys.stdout.flush()


@pytest.fixture
def book_slug():
    book_list = utility.Library()
    return book_list.random_book_slug()
