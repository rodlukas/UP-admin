Feature: Operations with courses

  Background: Prepared database and logged user
    Given the database with some courses
    And the logged user

  @add @courses @fast.row<row.id>
  Scenario Outline: Add valid course
    When user adds new course "<name>" with visibility "<visibility>", duration "<duration>" and color "<color>"
    Then the course is added

    Examples: Courses
      | name                 | visibility | duration | color   |
      | Rozvoj grafomotoriky | True       | 35       | #D2527F |
      | Kompletní příprava   | False      | 40       | #F39C12 |
      # barva se 3 cisly
      | RoPraTem             | False      | 40       | #F39    |
      # barva malymi pismeny
      | RoPraTem             | False      | 40       | #f39    |

  @add @courses
  Scenario Outline: Add invalid course
    When user adds new course "<name>" with visibility "<visibility>", duration "<duration>" and color "<color>"
    Then the course is not added

    Examples: Courses
      | name                 | visibility | duration | color    |
      # chybi nazev kurzu
      |                      | True       | 35       | #00B16A  |
      # duplicitni nazev kurzu
      | Kurz Slabika         | False      | 20       | #00B16A  |
      # chybejici doba trvani kurzu
      | Rozvoj grafomotoriky | False      |          | #00B16A  |

  @edit @courses
  Scenario: Edit course
    When user updates the data of course "Kurz Slabika" to name "Kurz Slabika 2", visibility "False", duration "55" and color "#2EA0BA"
    Then the course is updated

  @delete @courses
  Scenario Outline: Delete course
    When user deletes the course "<name>"
    Then the course is deleted

    Examples: Courses
      | name             |
      | Kurz Slabika     |
      | Máme doma leváka |

