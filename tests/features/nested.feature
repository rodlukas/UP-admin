Feature: Add a client while adding a group or an applicant

  Background: Prepared database and logged user
    Given the database with some clients, groups and courses
    And the logged user

  @nested @ui_only @fast.row1.1
  Scenario: Add a client while adding a group
    When user adds group "Nova skupina" in course "Kurz Slabika" with a new client "Test" "Novák"
    Then the group "Nova skupina" has member "Novák Test"

  @nested @ui_only
  Scenario: Add a client while adding an applicant
    When user adds an applicant "Eva" "Svobodová" for course "Kurz Slabika" with note "z formulare"
    Then the applicant "Svobodová Eva" for course "Kurz Slabika" is on the list
