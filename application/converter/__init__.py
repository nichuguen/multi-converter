# -*- coding: utf-8 -*-
from flask import Flask

app = Flask(__name__)

import converter.routes
import converter.errors
