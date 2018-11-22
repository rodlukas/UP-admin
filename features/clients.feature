Feature: Operations with clients

  Scenario: Add client through API
    Given the database with some clients
    And the user is logged
    When user adds new client through API
    Then the client is in our database

  Scenario: Add client through frontend
    Given the database with some clients
    And the user is logged on frontend
    When user adds new client through frontend
    Then the client is visible on frontend
