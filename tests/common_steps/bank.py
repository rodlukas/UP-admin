from behave import given
from django.test import override_settings


@given("the bank connection is turned off")
def step_impl(context):
    # vychozi hodnota BANK_ACTIVE je False, ale lokalni .env ji muze zapnout - test by pak
    # volal skutecne (rate-limited) API banky; nastaveni plati i pro live server UI stage
    override = override_settings(BANK_ACTIVE=False)
    override.enable()
    context.add_cleanup(override.disable)
