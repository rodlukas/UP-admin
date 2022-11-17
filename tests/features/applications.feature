Feature: Operations with applications

  Background: Prepared database and logged user
    Given the database with some clients, applications and courses
    And the logged user

  @add @applications @fast.row<row.id>
  Scenario Outline: Add valid application
    When user adds new application from client "<full_name>" for course "<course>" with note "<note>"
    Then the application is added

    Examples: Applications
      | full_name       | course            | note               |
      | Rodová Petra    | Kurz Slabika      | testovací poznámka |
      | Rod Lukáš       | Předškolák s ADHD |                    |
      | Jirušková Aneta | xyz               | 55-*/%ˇ:_(4$       |
      # neaktivni klient (musi projit)
      | Rod Lukáš       | Předškolák s ADHD |                    |

  @add @applications
  Scenario Outline: Add invalid application
    When user adds new application from client "<full_name>" for course "<course>" with note "<note>"
    Then the application is not added

    Examples: Applications
      | full_name | course           | note               |
      # chybi jmeno klienta
      |           | Kurz Slabika     |                    |
      # chybi kurz
      | Rod Lukáš |                  | testovací poznámka |
      # neexistujici kurz
      | Rod Lukáš | blabla           | testovací poznámka |
      # neexistujici klient
      | blabla    | Kurz Slabika     |                    |
      # zajemce o skryty kurz
      | Rod Lukáš | Máme doma leváka | testovací poznámka |
      # duplicitni zaznam - klienta se zajmem o dany kurz uz evidujeme
      | Rod Lukáš | Kurz Slabika     | testovací poznámka |

  @edit @applications
  Scenario: Edit application
    When user updates the data of the application from client "Rod Lukáš" for course "Kurz Slabika" to client "Uhlíř Jaroslav", course "xyz" and note "xxx"
    Then the application is updated

  @delete @applications @ci
  Scenario: Delete application
    When user deletes the application from client "Rod Lukáš" for course "Kurz Slabika"
    Then the application is deleted
