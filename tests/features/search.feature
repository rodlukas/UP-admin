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

  @search @ui_only
  Scenario: Edit a client reached from search
    When user searches and opens "Rodová Petra"
    And user changes the phone on the open card to "777888999"
    Then the open card shows phone "777 888 999"

  @search @ui_only
  Scenario: Delete a client reached from search
    When user searches and opens "Jirušková Aneta"
    And user deletes the client on the open card
    Then the client "Jirušková Aneta" is gone from the list
