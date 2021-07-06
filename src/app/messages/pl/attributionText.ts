// tslint:disable max-line-length
export const defaultText = `
<p>
 Chcesz zacytować, udostępnić albo zmodyfikować treść tej książki? Została ona wydana na licencji,
  <a target=""_blank"" rel=""noopener"" href=""{bookLicenseUrl}"">
    {bookLicenseName} {bookLicenseVersion}
  </a> która wymaga od Ciebie uznania autorstwa {copyrightHolder}.{originalMaterialLink, select,
    null {}
    other {Oryginalna publikacja jest dostępna na: <a target=""_blank"" rel=""noopener"" href=""{originalMaterialLink}"">
      {originalMaterialLink}
    </a>.}
  }{copyrightHolder, select,
    OpenStax {}
    other {Wprowadzono modyfikacje oryginalnej publikacji, w tym aktualizacje ilustracji, struktury i treści.}}
</p>

<strong>Cytowanie i udostępnienia</strong>
<ul>
  <li>
Jeśli rozpowszechniasz tę książkę w formie drukowanej, umieść na każdej jej kartce informację:
    <blockquote>
Treści dostępne za darmo na https://openstax.org{introPageUrl}
    </blockquote>
  </li>
  <li>

Jeśli rozpowszechniasz całą książkę lub jej fragment w formacie cyfrowym, na każdym widoku strony umieść informację:
    <blockquote>
  Treści dostępne za darmo na<a href=""https://openstax.org{introPageUrl}"">https://openstax.org{introPageUrl}</a>
    </blockquote>
  </li>
</ul>

<strong> Cytowanie</strong>
<ul>
  <li>
Jeśli chcesz zacytować tę książkę, skorzystaj z dostępnych narzędzi do tworzenia wpisów bibliograficznych, jak np.:
    <a target=""_blank"" rel=""noopener"" href=""https://www.lib.ncsu.edu/citationbuilder/#/default/default"">ten</a>.
    <ul>
      <li>
    Autorzy: {bookAuthors}
      </li>
      <li>
     Wydawca/strona internetowa: OpenStax
      </li>
      <li>
     Tytuł książki: {bookTitle}
      </li>
      <li>
        Data publikacji: {bookPublishDate, date, medium}
      </li>
      <li>
     Miejscowość: Houston, Teksas
      </li>
      <li>
     URL książki: <a href=""https://openstax.org{introPageUrl}"">https://openstax.org{introPageUrl}</a>
      </li>
      <li>
      URL fragmentu: <a href=""https://openstax.org{currentPath}"">https://openstax.org{currentPath}</a>
      </li>
    </ul>
  </li>
</ul>

<p>
  © {bookLatestRevision, date, medium} {copyrightHolder}. {copyrightHolder, select,
    OpenStax {Treść książki została wytworzona przez OpenStax na licencji {bookLicenseName} {bookLicenseVersion}. }
    other {}}<strong> Nazwa OpenStax, logo OpenStax, okładki OpenStax, nazwa OpenStax CNX oraz OpenStax CNX logo
 nie podlegają licencji Creative Commons i wykorzystanie ich jest dozwolone wyłącznie na mocy uprzedniego pisemnego upoważnienia przez Rice University.</strong>
</p>
`;
