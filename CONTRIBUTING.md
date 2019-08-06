# :+1::tada: Thanks for Contributing! :tada::+1:

See [openstax/CONTRIBUTING.md](https://github.com/openstax/napkin-notes/CONTRIBUTING.md) for more information!


# Creating a Pull Request or Issue

- include a screenshot in the **Issue/PR body** (if UI changed)
- add either `Needs Code` or `Needs Review` label
- if it is waiting on input from someone add the `blocked` label
- if it is linked to another Issue or Pull Request, link the Issue/PR number by editing the Issue/PR **body**
- link to the Ticket/Issue in the Issue/PR **body**

### Creating a hotfix

1. Find the commit SHA to base the hotfix on
2. create a `hotfix-*` branch
3. make a Pull request to `master` (note: it may have merge conflicts)
4. add the `HOTFIX` label
5. deploy the hotfix
6. merge master in (**DO NOT REBASE!** It is important to make sure the deployed commit is in master for undoability)
7. merge the Pull request


# Code to Include

- Fix lint warnings by running `npm run lint-cjsx`
- Every element should have a `className`
  - prefix the classname with `-` if it does not appear in CSS
- Add Unit tests if the model or logic changed


# Reviewing a Pull Request

- Use :+1: reaction when an issue is resolved but the comment is still visible in the Pull Request page


# Merging or Closing a Pull Request

- delete the branch
