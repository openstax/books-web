# Selenium tests for rex-web

## Getting Started

### Training

To learn more about Pytest and Selenium please utilize the [Introduction to Pytest and Selenium][selenium-training] training wiki article.

### Clone the repository

If you have cloned this project already then you can skip this, otherwise you'll
need to clone this repo using Git. If you do not know how to clone a GitHub
repository, check out this [help page][git-clone] from GitHub.

## How to prepare the project locally

### Install dependencies

#### Create a virtualenv

```bash
$ make venv
```

#### Activate the virtualenv

```bash
$ source .venv/bin/activate
```

## Run the tests using Pytest

To run all the tests, pass in a value for `--base-url`. If this is being run locally `yarn start` will display the local url:

```bash
$ pytest --driver Chrome --base-url https://rex-web.herokuapp.com ./pytest-selenium/tests
```

To run a specific test, pass in a value for `-k` and `--base-url` for the site url:

```bash
$ pytest -k test_my_feature --driver Chrome --base-url https://rex-web.herokuapp.com ./pytest-selenium/tests
```

### Additional Pytest Options

The pytest plugin that we use for running tests has a number of advanced
command line options available. To see the options available, run
`pytest --help`. The full documentation for the plugin can be found
[here][pytest-selenium].

## Uploading results to TestRail

The TestRail integration is currently intended to be used during a local test run of the rex-web pytest suite when the uploading of results to TestRail is desired.

Create a `testrail.cfg` file:

```bash
$ touch ./testrail.cfg
```

Add these configs with the appropriate values:

```
[API]
url = https://instance.testrail.net/
email = testrail_user@domain.com
password = api_key

[TESTRUN]
assignedto_id = id_of_user
name = default_test_run_name
project_id = id_number
suite_id = id_number
```

To run the tests only for TestRail and the table of contents module:

```bash
$ pytest -k test_toc --driver Chrome --base-url https://rex-web.herokuapp.com --testrail --testrail-name release01 ./pytest-selenium/tests
```

Consult the [pytest-testrail project][pytest-testrail] for more options

### Marking a test that has a test case in TestRail

Use the `markers.text_case` decorator with case number to upload the results to TestRail. More than one test case can be used by separating with a comma.

```python
@markers.test_case('C10000', 'C10001')
def test_foo_uploads_bar:
```

#### Install git pre-commit hooks

This utilizes [pre-commit](https://pre-commit.com/) to format code using [black](https://github.com/ambv/black)
and lint your code using [flake8][flake8]. This is IDE agnostic and runs only on checked in code before a commit. 

```bash
$ make precommit
```

## Framework Design

This testing framework heavily relies on the [PyPOM][pypom]. The [PyPOM][pypom]
library is the Python implementation of the [PageObject][pageobject] design pattern.

The [PageObject][pageobject] pattern creates a nice API abstraction around
an HTML page allowing the test creator to focus on the intent of a test
rather than decyphering HTML code. This design pattern makes the test framework
much more maintainable as any code changes to the page can occur in the
[PageObject][pageobject] rather than within the test code.

According to Siman Stewart,

> If you have WebDriver APIs in your test methods, You're Doing It Wrong.

The usage of [pytest][pytest], [pytest-selenium][pytest-selenium] plugin,
and the [PageObject][pageobject] pattern allows for a succinct test structure
like so:

```python
from tests import markers

from pages.home import Home

@markers.webview
@markers.nondestructive
def test_nav_is_displayed(webview_base_url, selenium):
    # GIVEN the main website URL and the Selenium driver

    # WHEN The main website URL is fully loaded
    page = Home(selenium, webview_base_url).open()

    # THEN The navbar is displayed
    assert page.header.is_nav_displayed
```

[git-clone]: https://help.github.com/articles/cloning-a-repository/
[python]: https://www.python.org/downloads/
[flake8]: http://flake8.readthedocs.io/
[pytest-selenium]: http://pytest-selenium.readthedocs.org/
[pytest-testrail]: https://github.com/allankp/pytest-testrail
[pypom]: https://pypom.readthedocs.io/en/latest/user_guide.html#regions
[pageobject]: https://martinfowler.com/bliki/PageObject.html
[pytest]: https://docs.pytest.org/en/latest/
[mozilla]: https://github.com/mozilla/addons-server
[selenium-training]: https://qualitas-server.herokuapp.com/wiki/Introduction_to_Pytest_and_Selenium
