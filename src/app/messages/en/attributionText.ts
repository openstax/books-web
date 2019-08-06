export default `
<p>
  Want to cite, share, or modify this book? This book is {bookLicenseName}
  {bookLicenseVersion} and you must attribute OpenStax.
</p>

<strong>Attribution information</strong>
<ul>
  <li>
    If you are redistributing all or part of this book in a print format,
    then you must include on every physical page the following attribution:
    <blockquote>
      Access for free at https://openstax.org{introPageUrl}
    </blockquote>
  </li>
  <li>
    If you are redistributing all or part of this book in a digital format,
    then you must include on every digital page view the following attribution:
    <blockquote>
      Access for free at <a href="https://openstax.org{introPageUrl}">https://openstax.org{introPageUrl}</a>
    </blockquote>
  </li>
</ul>

<strong>Citation information</strong>
<ul>
  <li>
    Use the information below to generate a citation. We recommend using a
    citation tool such as
    <a target="_blank" rel="noopener" href="https://www.lib.ncsu.edu/citationbuilder/#/default/default">this one</a>.
    <ul>
      <li>
        Authors: {bookAuthors}
      </li>
      <li>
        Publisher/website: OpenStax
      </li>
      <li>
        Book title: {bookTitle}
      </li>
      <li>
        Publication date: {bookPublishDate, date, medium}
      </li>
      <li>
        Location: Houston, Texas
      </li>
      <li>
        Book URL: <a href="https://openstax.org{introPageUrl}">https://openstax.org{introPageUrl}</a>
      </li>
      <li>
        Section URL: <a href="https://openstax.org{currentPath}">https://openstax.org{currentPath}</a>
      </li>
    </ul>
  </li>
</ul>

<p>
  © {bookPublishDate, date, medium} OpenStax. Textbook content produced by OpenStax is licensed under a
  {bookLicenseName} {bookLicenseVersion} license. <strong>The OpenStax logo, OpenStax book
  covers, and OpenStax CNX logo are not subject to the Creative Commons license and may
  not be reproduced without the prior and express written consent of Rice University.</strong>
</p>
`;
