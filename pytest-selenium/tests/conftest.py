import os
import random
import sys

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
    desktop_only = request.node.get_closest_marker("desktop_only")
    mobile_only = request.node.get_closest_marker("mobile_only")
    if mobile_only and request.param == DESKTOP:
        pytest.skip("Skipping desktop test")
    elif desktop_only and request.param == MOBILE:
        pytest.skip("Skipping mobile test")
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
        "--highlighting",
        action="store_true",
        default=os.getenv("HIGHLIGHTING", False),
        help="enable highlighting tests",
    )
    group.addoption(
        "--no-sandbox",
        action="store_true",
        default=os.getenv("NO_SANDBOX", False),
        help="disable chrome's sandbox.",
    )


def pytest_collection_modifyitems(config, items):
    """Runtime test options."""
    server = config.getoption("--base-url") or config.getini("base_url")
    dev_system = "//staging.openstax." not in server and "//openstax." not in server
    heroku_app = "herokuapp" in server
    highlighting = config.getoption("--highlighting")
    if dev_system and not heroku_app and highlighting:
        return

    deselected = []
    remaining = []
    for item in items:
        keywords = item.keywords
        if not dev_system and "dev_only" in keywords:
            deselected.append(item)
        elif heroku_app and "non_heroku" in keywords:
            deselected.append(item)
        elif not highlighting and "highlighting" in keywords:
            deselected.append(item)
        else:
            remaining.append(item)

    if deselected:
        config.hook.pytest_deselected(items=deselected)
        items[:] = remaining


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

    chrome_options.add_experimental_option("w3c", False)

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


@pytest.fixture
def email(store):
    """ Random user email fetched from secure store

    :param store: secure store decrypt file
    :return: user email -> str
    """
    user_info = random.choice((store.get("_user_info")))
    return user_info["email"]


@pytest.fixture
def password(store):
    """ Random user password fetched from secure store

    :param store: secure store decrypt file
    :return: user password -> str
    """
    user_info = random.choice((store.get("_user_info")))
    return user_info["password"]
