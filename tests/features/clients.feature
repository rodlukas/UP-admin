Feature: Operations with clients

  Background: Filled database with clients
    Given the database with two clients
    And the user is logged

  Scenario: Add client
    When user adds new client
    Then the client is added
