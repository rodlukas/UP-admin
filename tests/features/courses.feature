Feature: Operations with courses

  Background: Prepared database and logged user
    Given the database with some courses
    And the logged user

  @add @courses
  Scenario Outline: Add valid course
    When user adds new course "<name>" with visibility "<visibility>" and duration "<duration>"
    Then the course is added

    Examples: Courses
      | name                 | visibility | duration |
      | Rozvoj grafomotoriky | True       | 30       |
      | Kompletní příprava   | False      | 40       |

  @add @courses
  Scenario Outline: Add invalid course
    When user adds new course "<name>" with visibility "<visibility>" and duration "<duration>"
    Then the course is not added

    Examples: Courses
      | name                 | visibility | duration |
      |                      | True       | 30       |
      # duplicitni nazev kurzu
      | Kurz Slabika         | False      | 20       |
      # chybejici doba trvani kurzu
      | Rozvoj grafomotoriky | False      |          |

  @edit @courses
  Scenario: Edit course
    When user updates the data of course "Kurz Slabika" to name "Kurz Slabika 2", visibility "False" and duration "55"
    Then the course is updated

  @delete @courses
  Scenario Outline: Delete course
    When user deletes the course "<name>"
    Then the course is deleted

    Examples: Courses
      | name             |
      | Kurz Slabika     |
      | Máme doma leváka |

