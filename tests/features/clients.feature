Feature: Operations with clients

  Background: Filled database with clients
    Given the database with two clients
    And the user is logged

  Scenario Outline: Add valid clients
    When user adds new client "<name>" "<surname>" with phone "<phone>", email "<email>" and note "<note>"
    Then the client is added

    Examples: Clients
      | name        | surname     | phone       | email                 | note      |
      | Lukáš       | Rod         | 123456789   | bla.bla@centrum22.cz  | test      |
      | Drahomíra   | Novotná     |             |                       |           |
      | Lukáš       | Rod         | 123 456 789 | bla.bla@centrum22.cz  |           |


  Scenario Outline: Add invalid clients
    When user adds new client "<name>" "<surname>" with phone "<phone>", email "<email>" and note "<note>"
    Then the client is not added

    Examples: Clients
      | name      | surname | phone     | email                | note |
      # nevalidni telefonni cislo
      | Lukáš     | Rod     | 12345678  |                      |      |
      | Lukáš     | Rod     | 12345678s |                      |      |
      | Lukáš     | Rod     | sssssssss |                      |      |
      | Lukáš     | Rod     | 1         |                      |      |
      | Lukáš     | Rod     | ---       |                      |      |
      # nevalidni e-mail
      | Lukáš     | Rod     |           | b@b                  |      |
      | Lukáš     | Rod     |           | b                    |      |
      | Lukáš     | Rod     |           | @b.cz                |      |
      | Lukáš     | Rod     |           | @b                   |      |
      | Lukáš     | Rod     |           | s@b.2                |      |
      | Lukáš     | Rod     |           | @                    |      |
      # chybejici jmeno/prijmeni
      | Lukáš     |         |           |                      |      |
      |           | Rod     |           |                      |      |
      |           |         |           |                      |      |
