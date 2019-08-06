from pytest import mark
from pytest_testrail.plugin import pytestrail

parametrize = mark.parametrize
nondestructive = mark.nondestructive
test_case = pytestrail.case
mobile_only = mark.mobile_only
