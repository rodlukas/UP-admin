Feature: Search for clients and groups

  Background: Prepared database and logged user
    Given the database with some clients, groups, courses and attendance states
    And the logged user

  @search @ui_only @fast.row1.1
  Scenario: Search opens a client card
    When user searches and opens "Rodová Petra"
    Then the client card of "Rodová Petra" is open

  @search @ui_only
  Scenario: Search ignores diacritics
    When user searches for "rodova" and opens "Rodová Petra"
    Then the client card of "Rodová Petra" is open

  @search @ui_only
  Scenario: Search opens a group card
    When user searches and opens "Slabika 4"
    Then the group card of "Slabika 4" is open

  @search @ui_only
  Scenario: Search with no match stays empty
    When user types "zzzzzz" into the search
    Then the search shows no results
