import { notification } from "antd";
import ApiService from "./ApiServices";

const roundOff = 5;

const infoNotification = (msg) => {
  notification.info({
    message: `INFO`,
    message: msg,
  });
};

const formatNumber = (number) => {
  //return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(number);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(number);
};

const findInitLetters = (...value) => {
  let initLetters = "";
  value.map((val) => (initLetters += val.charAt(0).toUpperCase()));
  return initLetters;
};

const formatAddress = (values) => {
  // const values = getValues();
  // console.log(values.addresses);
  let v = "";

  values.addresses.map((e) => {
    if (e.shipping) {
      v = `${e.country},${e.addressee},${e.phone},\n${e.address1},\n${e.address2},\n${e.address3},\n${e.city},\n${e.state},\n${e.zip},\n
      `;
    }
  });

  return v;
};

const formatAddressByDefault = (values) => {
  // const values = getValues();

  // console.log(values.addresses);

  let v = "";

  values?.addresses?.map((e) => {
    if (e.default) {
      v = `${e.country},\n${e.addressee},\n${e.phone},\n${e.address1},\n${e.address2},\n${e.address3},\n${e.city},\n${e.state},\n${e.zip},\n

      `;
    }
  });

  return v;
};

const formatAddressNew = (value) => {
  // const values = getValues();

  // console.log(values.addresses);

  let v = `${value.country},\n${value.addressee},\n${value.phone},\n${value.address1},\n${value.address2},\n${value.address3},\n${value.city},\n${value.state},\n${value.zip},\n`;

  return v;
};

class TanasUtils {
  /**
   * This method is use to find the Price of each size in a pack.
   *
   * @param {Number} min Minimum size in the pack
   * @param {*} max Maximum size in the pack.
   * @param {Number} basePrice Base Price
   * @param {Number} expense Expense
   * @param {Number} transportChargePer Transportation charge in number. eg. 8% is 8, 40% is 40
   * @param {Number} profitPer Profit Percentage in number. eg. 45% is 45, 75% is 75.
   * @param {Number} gst GST Percentage in number
   * @returns Object
   */
  calculatePrice(
    min,
    max,
    basePrice,
    expense,
    transportChargePer,
    profitPer,
    gst
  ) {
    let arrayOfSize = new Array();

    const priceFactor = this.findPriceFactor(basePrice);
    const result = this.findMedian(min, max);

    if (result.median) {
      for (var i = min; i <= max; i += 2) {
        let totalPrice =
          basePrice + ((i - result.median) * priceFactor) / 2 + expense;
        //console.log(i, (Math.ceil(totalPrice * (1 + transportChargePer / 100) * (1 + profitPer / 100) * (1 + gst / 100) / 5)) * 5)
        const eachSize = {
          size: i,
          price:
            Math.ceil(
              (totalPrice *
                (1 + transportChargePer / 100) *
                (1 + profitPer / 100) *
                (1 + gst / 100)) /
                roundOff
            ) * roundOff,
        };

        arrayOfSize.push(eachSize);
      }
      return arrayOfSize;
    } else {
      return "Something went wrong, please check the size you have provided!";
    }
  }

  /**
   * This method is use to find the median(the middle value) in a list ordered from smallest to largest.
   *
   * @param {Number} min - Minimun size in the pack.
   * @param {Number} max - Maximum size in the pack.
   * @returns Object
   */
  findMedian(min, max) {
    let sumOfSize = (min + max) / 2;
    return { median: sumOfSize };
  }

  isOddNumberOfSize(min, max) {
    let sumOfSize = (min + max) / 2;
    if (sumOfSize % 2 == 0) return { isOdd: true, median: sumOfSize };
    else return { isOdd: false, median: sumOfSize };
  }

  /**
   * This method is use to find the price factor
   * Rules
   * price: 1 - 25 return 1
   * price: 26 - 50 return 2
   * price: 51 - 75 return 3
   * ..
   * ..
   * price: 501 - 525 return 21
   * @param {Number} price - Base price of the product.
   * @returns Number
   */
  findPriceFactor(price) {
    let result = price / 25;
    return Math.ceil(result);
  }
}

const errorMessage = (err, dispatch) => {
  console.log(err.response?.data);
  if (
    err.response?.data.message == "Logged out.please log in" ||
    err.response?.data.message ==
      "You are not logged in! Please log in to get access." ||
    err.response?.data.message ==
      "The user belonging to this token does no longer exist."
  ) {
    notification.error({
      message: "Error",
      description: err.response?.data.message,
      style: {
        color: "red",
      },
    });

    // Logout user
    dispatch({ type: "LOGOUT_USER" });
  } else {
    notification.error({
      message: "Error",
      description: err.response?.data.message,
      style: {
        color: "red",
      },
    });
  }
};

const checkBlank = (e, index, field, setValue) => {
  if (e.target.value == "") {
    setValue(`products.${index}.${field}`, 1.0);
  }
};

const checkDuplicateEmail = async (email, id) => {
  let isIssue = false;
  ApiService.setHeader();
  const response = await ApiService.get("employee");
  const res = await ApiService.get(`employee/${id}`);
  if (res.data.document.email == email) {
    isIssue = false;
  } else {
    response.data.documents?.map((e) => {
      if (e.email == email) {
        infoNotification("This email is already present");
        isIssue = true;
      }
    });
  }

  return isIssue;
};

const checkDuplicateEmailForCreate = async (email) => {
  let isIssue = false;
  ApiService.setHeader();
  const response = await ApiService.get("employee");

  response.data.documents?.map((e) => {
    if (e.email == email) {
      infoNotification("This email is already present");
      isIssue = true;
    }
  });

  return isIssue;
};

// Show notification if product's HSN and UOM field is not selected
const validationOnProductForm = (data) => {
  let isIssue = false;

  if (data.HSNSACS == "Choose..") {
    notification.info({
      message: `INFO`,
      description: `Please select HSNSACS`,
    });
    isIssue = true;
  }

  if (data.uom == "Select...") {
    notification.info({
      message: `INFO`,
      description: `Please select Units`,
    });
    isIssue = true;
  }

  if (data.salesPrice < 0 || data.cost < 0) {
    notification.info({
      message: `INFO`,
      description: `Please select positive number`,
    });
    isIssue = true;
  }

  return isIssue;
};
const checkEmptyINVADJProducts = (products) => {
  let isIssue = false;

  products?.map((e) => {
    if (e.product == "" || e.quantity == "" || e.unitPrice == "") {
      notification.info({
        message: `INFO`,
        description: `Please select positive number`,
      });
      isIssue = true;
    }
  });

  return isIssue;
};

const checkBlankProduct = (products) => {
  console.log(products);
  let isBlank;
  products?.map((e) => {
    if (e.product == null || e.product == "") {
      isBlank = true;
    } else {
      isBlank = false;
    }
  });
  return isBlank;
};

const validationOnSOForm = (data) => {
  let isBlank = false;
  let isIssue = false;
  console.log(data);

  if (
    data.customer == "Choose.." ||
    data.customer == "" ||
    data.customer == null
  ) {
    infoNotification(`Please select customer`);
    isBlank = true;
    return isBlank;
  }

  if (data.products == 0) {
    infoNotification("You can't save the sales order");
    isBlank = true;
    return isBlank;
  }

  data.products?.map((e) => {
    if (e.product == "" || e.quantity == "" || e.unitPrice == "") {
      notification.info({
        message: `INFO`,
        description: `Please fill product or quantity or unit rate field`,
      });
      isBlank = true;
      return isBlank;
    }

    if (e.quantity < 0 || e.unitPrice < 0) {
      notification.info({
        message: `INFO`,
        description: `Negative number is not allowed`,
      });
      isBlank = true;
      return isBlank;
    }
  });
};

const validationOnPOForm = (data) => {
  let isBlank = false;

  if (data.vendor == "Choose.." || data.vendor == "" || data.vendor == null) {
    infoNotification(`Please select vendor`);
    isBlank = true;
    return isBlank;
  }

  if (data.products == 0) {
    infoNotification("You can't save the sales order");
    isBlank = true;
    return isBlank;
  }

  data.products?.map((e) => {
    if (
      e.product == null ||
      e.product == "" ||
      e.quantity == "" ||
      e.unitPrice == ""
    ) {
      notification.info({
        message: `INFO`,
        description: `Please fill product or quantity or unit rate field`,
      });
      isBlank = true;
      console.log(isBlank);
    }

    if (e.quantity < 0 || e.unitPrice < 0) {
      notification.info({
        message: `INFO`,
        description: `Negative number is not allowed`,
      });
      isBlank = true;
    }
  });
  return isBlank;
};

const validationOnStandaloneInvoiceForm = (data) => {
  let isBlank = false;
  let isIssue = false;
  console.log(data);

  if (
    data.customer == "Choose.." ||
    data.customer == "" ||
    data.customer == null
  ) {
    infoNotification(`Please select customer`);
    isBlank = true;
  }

  if (
    data.recepientAccount == "" ||
    data.recepientAccount == "Choose.." ||
    data.recepientAccount == null
  ) {
    infoNotification("Please select Recepient account");
    isBlank = true;
  }

  if (data.invoiceLines == 0) {
    infoNotification("You can't save the sales order");
    isBlank = true;
  }

  data.invoiceLines?.map((e) => {
    if (
      e.product == "Select..." ||
      e.account == "Choose.." ||
      e.quantity == "" ||
      e.unitPrice == ""
    ) {
      notification.info({
        message: `INFO`,
        description: `Please fill product or account or quantity or unit rate field`,
      });
      isBlank = true;
    }
  });

  data.invoiceLines?.map((e) => {
    if (e.quantity < 0 || e.unitPrice < 0) {
      notification.info({
        message: `INFO`,
        description: `Negative number is not allowed`,
      });
      isBlank = true;
    }
  });
  return isBlank;
};

const validationOnStandaloneBillForm = (data) => {
  let isBlank = false;
  let isIssue = false;
  console.log(data);

  if (data.vendor == "Choose.." || data.vendor == "" || data.vendor == null) {
    infoNotification(`Please select vendor`);
    isBlank = true;
  }

  if (data.invoiceLines == 0) {
    infoNotification("You can't save the sales order");
    isBlank = true;
  }

  data.invoiceLines?.map((e) => {
    if (e.product == "Select..." || e.quantity == "" || e.unitPrice == "") {
      infoNotification(
        `Please fill product or account or quantity or unit rate field`
      );
      isBlank = true;
    }
  });

  data.invoiceLines?.map((e) => {
    if (e.quantity < 0 || e.unitPrice < 0) {
      infoNotification("Negative number is not allowed");
      isBlank = true;
    }
  });
  return isBlank;
};

const validationOnVendorForm = (data) => {
  let isBlank = false;
  let isIssue = false;
  console.log(data);

  if (data.vendor == "") {
    infoNotification(`Please enter vendor name`);
    isBlank = true;
  }

  if (data.phone == "") {
    infoNotification(`Please enter vendor phone`);
    isBlank = true;
  }

  if (data.email == "") {
    infoNotification(`Please enter vendor email`);
    isBlank = true;
  }

  if (data.addresses.length == 0) {
    infoNotification("Please add one address");
    isBlank = true;
  }
  return isBlank;
};

const isBillAmountEqualPurchaseAmount = (billObj, POData) => {
  if (billObj.estimation.total == POData.estimation.total) {
    return true;
  } else {
    return false;
  }
};

export {
  formatAddressNew,
  formatAddressByDefault,
  formatNumber,
  findInitLetters,
  formatAddress,
  TanasUtils,
  errorMessage,
  checkBlank,
  isBillAmountEqualPurchaseAmount,
  infoNotification,
};
