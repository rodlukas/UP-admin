from behave import given, when, step
from admin.models import Client
from django.contrib.auth import get_user_model
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.common.by import By
from tests import helpers


@given("the database with some clients")
def step_impl(context):
    helpers.add_two_clients()
    assert Client.objects.count() > 0


@when('user adds new client')
def step_impl(context):
    context.name = "Josef"
    context.surname = "Voříšek2"
    assert Client.objects.filter(name=context.name, surname=context.surname).count() == 0
    context.browser.implicitly_wait(5)
    context.browser.find_element_by_xpath("/html/body/div[1]/div/nav/div/ul/li[3]/a").click()
    context.browser.find_element_by_xpath("/html/body/div[1]/div/div[2]/div/div/h1/button").click()
    context.browser.find_element_by_id('name').send_keys(context.name)
    context.browser.find_element_by_id('surname').send_keys(context.surname)
    context.browser.find_element_by_id('surname').submit()


@step("the user is logged")
def step_impl(context):
    context.browser.get(context.base_url)
    user = helpers.add_user()
    context.old_cnt = Client.objects.all().count()
    context.browser.find_element_by_id('username').send_keys(user['username'])
    context.browser.find_element_by_id('password').send_keys(user['password'])
    context.browser.find_element_by_id('password').submit()
    context.browser.implicitly_wait(5)
    dashboard = context.browser.find_elements_by_xpath("//*[text()='Dnešní přehled']")
    assert len(dashboard) == 1


@step("the client is added")
def step_impl(context):
    search_name = context.surname + " " + context.name
    # wait for new client addition
    wait = WebDriverWait(context.browser, 5)
    wait.until(expected_conditions.presence_of_element_located((
        By.XPATH, f"//table[@id='clients']/tbody/tr[{context.old_cnt + 1}]/td[1]/span/a/span")))
    clients = context.browser.find_elements_by_xpath(".//table[@id='clients']/tbody/tr")
    same_client_cnt = 0
    for client in clients:
        name = client.find_element_by_xpath("td[1]/span/a/span").text
        if name == search_name:
            same_client_cnt += 1
    assert same_client_cnt == 1
