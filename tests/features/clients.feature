Feature: Operations with clients

  Background: Prepared database and logged user
    Given the database with some clients
    And the logged user

  @add @clients
  Scenario Outline: Add valid clients
    When user adds new client "<name>" "<surname>" with phone "<phone>", email "<email>" and note "<note>"
    Then the client is added

    Examples: Clients
      | name      | surname | phone       | email                | note |
      | Lukáš     | Rod     | 123456789   | bla.bla@centrum22.cz | test |
      | Drahomíra | Novotná |             |                      |      |
      | Lukáš     | Rod     | 123 456 789 | bla.bla@centrum22.cz |      |


  @add @clients
  Scenario Outline: Add invalid clients
    When user adds new client "<name>" "<surname>" with phone "<phone>", email "<email>" and note "<note>"
    Then the client is not added

    Examples: Clients
      | name  | surname | phone     | email | note |
      # nevalidni telefonni cislo
      | Lukáš | Rod     | 12345678  |       |      |
      | Lukáš | Rod     | 12345678s |       |      |
      | Lukáš | Rod     | sssssssss |       |      |
      | Lukáš | Rod     | 1         |       |      |
      | Lukáš | Rod     | ---       |       |      |
      # nevalidni e-mail
      | Lukáš | Rod     |           | b@b   |      |
      | Lukáš | Rod     |           | b     |      |
      | Lukáš | Rod     |           | @b.cz |      |
      | Lukáš | Rod     |           | @b    |      |
      | Lukáš | Rod     |           | s@b.2 |      |
      | Lukáš | Rod     |           | @     |      |
      # chybejici jmeno/prijmeni
      | Lukáš |         |           |       |      |
      |       | Rod     |           |       |      |
      |       |         |           |       |      |

  @edit @clients
  Scenario Outline: Edit client
    When user updates the data of client "<cur_full_name>" to name "<new_name>", surname "<new_surname>", phone "<new_phone>", email "<new_email>" and note "<new_note>"
    Then the client is updated

    Examples: Clients
      | cur_full_name | new_name | new_surname | new_phone | new_email | new_note |
      # zadna zmena
      | Rod Lukáš     | Lukáš    | Rod         | 555555555 | r@r.cz    | test     |
      # zmena telefonu
      | Rod Lukáš     | Lukáš    | Rod         | 123456789 | r@r.cz    | test     |
      # zmena e-mailu
      | Rod Lukáš     | Lukáš    | Rod         | 555555555 | e@e.cz    | test     |
      # zmena poznamky
      | Rod Lukáš     | Lukáš    | Rod         | 555555555 | r@r.cz    | xxxx     |
      # zmena krestniho jmena
      | Rod Lukáš     | Pavel    | Rod         | 555555555 | r@r.cz    | test     |
      # zmena prijmeni
      | Rod Lukáš     | Lukáš    | Rodd        | 555555555 | r@r.cz    | test     |


  @delete @clients
  Scenario: Delete client
    When user deletes the client "Rod Lukáš"
    Then the client is deleted
