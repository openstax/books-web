import random
from random import choice


class Library(object):
    def __init__(self):
        self._book_slug_list = ["chemistry-2e", "chemistry-atoms-first-2e"]

    @property
    def books(self) -> [str]:
        return self._book_slug_list

    def random_book_slug(self):
        return random.choice(self.books)
