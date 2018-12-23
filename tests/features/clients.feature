Feature: Operations with clients

  Scenario: Add client
    Given the database with some clients
    And the user is logged
    When user adds new client
    Then the client is added
