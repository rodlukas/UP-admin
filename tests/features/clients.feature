Feature: Operations with clients

  Background: Filled database with clients
    Given the database with two clients
    And the user is logged

  Scenario Outline: Add valid client
    When user adds new client "<name>" "<surname>" with phone "<phone>", email "<email>" and note "<note>"
    Then the client is added

    Examples: Clients
      | name        | surname     | phone       | email                 | note      |
      | Lukáš       | Rod         | 123456789   | bla.bla@centrum22.cz  | test      |
      | Drahomíra   | Novotná     |             |                       |           |
      | Lukáš       | Rod         | 123456789   | bla.bla@centrum22.cz  |           |
