Feature: Client and group cards

  Background: Prepared database and logged user
    Given the database with some clients, groups, courses and attendance states
    And the logged user

  @card @ui_only @fast.row1.1
  Scenario: Edit a client from the card
    When user changes the phone of "Rodová Petra" on her card to "777888999"
    Then the open card shows phone "777 888 999"

  @card @ui_only
  Scenario: Delete a client without lectures from the card
    When user deletes "Jirušková Aneta" from her card
    Then the client "Jirušková Aneta" is gone from the list

  @card @ui_only
  Scenario: Client with lectures cannot be deleted
    When user tries to delete "Rodová Petra" from her card
    Then the deletion is refused because the client has lectures

  @card @ui_only
  Scenario: Edit a group name from the card
    When user renames group "Slabika 1" to "Slabika 9" on its card
    Then the open card shows group name "Slabika 9"

  @card @ui_only
  Scenario: Delete a group from the card
    When user deletes group "Slabika 2" from its card
    Then the group "Slabika 2" is gone from the list

  @card @ui_only
  Scenario: Move a stale client to inactive from the card
    When user deactivates "Rodová Petra" from her card
    Then the open card says the client is inactive

  @card @ui_only
  Scenario: Client analysis tab shows a chart
    When user opens the analysis of "Rodová Petra"
    Then the analysis shows a chart

  @card @ui_only
  Scenario: Client without lectures has no deactivate button
    When user opens the card of "Jirušková Aneta"
    Then the card has no deactivate button
