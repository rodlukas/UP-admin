Feature: Operations with clients

  Background: Prepared database and logged user
    Given the database with some clients
    And the logged user

  @add @clients @fast.row<row.id>
  Scenario Outline: Add valid clients
    When user adds new client "<firstname>" "<surname>" with phone "<phone>", email "<email>", note "<note>" and activity "<active>"
    Then the client is added

    Examples: Clients
      | firstname | surname | phone       | email                | note | active |
      | Lukáš     | Rod     | 123456789   | bla.bla@centrum22.cz | test | True   |
      | Drahomíra | Novotná |             |                      |      | True   |
      | Lukáš     | Rod     | 123 456 789 | bla.bla@centrum22.cz |      | True   |
      | Lukáš     | Rod     | 123 456 789 | bla.bla@centrum22.cz |      | False  |


  @add @clients
  Scenario Outline: Add invalid clients
    When user adds new client "<firstname>" "<surname>" with phone "<phone>", email "<email>", note "<note>" and activity "<active>"
    Then the client is not added

    Examples: Clients
      | firstname | surname | phone     | email | note | active |
      # nevalidni telefonni cislo
      | Lukáš     | Rod     | 12345678  |       |      | True   |
      | Lukáš     | Rod     | 12345678s |       |      | True   |
      | Lukáš     | Rod     | sssssssss |       |      | True   |
      | Lukáš     | Rod     | 1         |       |      | True   |
      | Lukáš     | Rod     | ---       |       |      | True   |
      # nevalidni e-mail
      | Lukáš     | Rod     |           | b@b   |      | True   |
      | Lukáš     | Rod     |           | b     |      | True   |
      | Lukáš     | Rod     |           | @b.cz |      | True   |
      | Lukáš     | Rod     |           | @b    |      | True   |
      | Lukáš     | Rod     |           | s@b.2 |      | True   |
      | Lukáš     | Rod     |           | @     |      | True   |
      # chybejici jmeno/prijmeni
      | Lukáš     |         |           |       |      | True   |
      |           | Rod     |           |       |      | True   |
      |           |         |           |       |      | True   |

  @edit @clients
  Scenario Outline: Edit client
    When user updates the data of client "<cur_full_name>" to firstname "<new_firstname>", surname "<new_surname>", phone "<new_phone>", email "<new_email>", note "<new_note>" and activity "<new_active>"
    Then the client is updated

    Examples: Clients
      | cur_full_name | new_firstname | new_surname | new_phone | new_email | new_note | new_active |
      # zadna zmena
      | Rod Lukáš     | Lukáš         | Rod         | 555555555 | r@r.cz    | test     | True       |
      # zmena telefonu
      | Rod Lukáš     | Lukáš         | Rod         | 123456789 | r@r.cz    | test     | True       |
      # zmena e-mailu
      | Rod Lukáš     | Lukáš         | Rod         | 555555555 | e@e.cz    | test     | True       |
      # zmena poznamky
      | Rod Lukáš     | Lukáš         | Rod         | 555555555 | r@r.cz    | xxxx     | True       |
      # zmena krestniho jmena
      | Rod Lukáš     | Pavel         | Rod         | 555555555 | r@r.cz    | test     | True       |
      # zmena prijmeni
      | Rod Lukáš     | Lukáš         | Rodd        | 555555555 | r@r.cz    | test     | True       |
      # zadna aktivity
      | Rod Lukáš     | Lukáš         | Rod         | 555555555 | r@r.cz    | test     | False      |


  @delete @clients
  Scenario: Delete client
    When user deletes the client "Rod Lukáš"
    Then the client is deleted
