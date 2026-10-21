Feature: Diary

  Background: Prepared database and logged user
    Given the database with some clients, groups, courses and attendance states
    And the logged user

  @diary @ui_only @fast.row1.1
  Scenario: Add a lecture for an existing client on a chosen day
    When user adds a single lecture from the diary on "2018-05-08" at "15:00" for "Rod Lukáš" in course "Kurz Slabika" with duration "20"
    Then the single lecture is on the card of "Rod Lukáš"

  @diary @ui_only
  Scenario: Add a group lecture from the diary
    When user adds a group lecture from the diary on "2018-05-08" at "16:00" for group "Slabika 4" with duration "40"
    Then the group lecture is on the card of "Slabika 4"

  @diary @ui_only
  Scenario: Add a lecture by creating a client in the diary wizard
    When user adds a lecture from the diary on "2018-05-08" at "17:00" for a new client "Klára" "Malá" in course "Kurz Slabika" with duration "20"
    Then the single lecture is on the card of "Malá Klára"

  @diary @ui_only
  Scenario: Add a lecture by creating a group and a new client in the diary wizard
    When user adds a lecture from the diary on "2018-05-08" at "18:00" for a new group "Slabika Nová" in course "Kurz Slabika" with a new client "Petr" "Dvořák" and duration "40"
    Then the group lecture is on the card of "Slabika Nová"

  @diary @ui_only
  Scenario: Edit a lecture from the diary
    When user edits the lecture at "20:00" on "2018-05-07" from the diary to duration "55" and note "z diáře"
    Then the single lecture is on the card of "Rodová Petra"

  @diary @ui_only
  Scenario: Week navigation changes the diary title
    When user moves to the next diary week and back
    Then the diary title returns to the original week
